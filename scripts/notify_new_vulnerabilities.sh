#!/bin/sh
# Post a Slack message when this pipeline's security scans report Critical findings that
# are not present in the latest successful scan of the default branch.
#
# Requires: SLACK_WEBHOOK_URL (masked CI/CD variable), curl, jq.
# Reports and the default-branch baseline are fetched with CI_JOB_TOKEN.
set -eu

if [ -z "${SLACK_WEBHOOK_URL:-}" ]; then
  echo "SLACK_WEBHOOK_URL not set; skipping notification."
  exit 0
fi

# job -> report file it produces. Several SAST jobs write the same filename
# (gl-sast-report.json), so each job's report is fetched individually from this
# pipeline's job artifacts instead of relying on the files `needs` unpacks into
# the working directory, where they would overwrite each other.
JOBS="gitlab-advanced-sast:gl-sast-report.json
semgrep-sast:gl-sast-report.json
sast:gl-sast-report.json
kics-iac-sast:gl-sast-report.json
dependency_scanning:gl-dependency-scanning-report.json
secret_detection:gl-secret-detection-report.json
container_scanning:gl-container-scanning-report.json"

api() { curl -sSf --header "JOB-TOKEN: $CI_JOB_TOKEN" "$@"; }

mkdir -p baseline
: > new_findings.jsonl

# Successful jobs of this pipeline as "name id" lines.
api "$CI_API_V4_URL/projects/$CI_PROJECT_ID/pipelines/$CI_PIPELINE_ID/jobs?per_page=100" \
  | jq -r '.[] | select(.status == "success") | "\(.name) \(.id)"' > pipeline_jobs.txt \
  || { echo "Could not list this pipeline's jobs; cannot read scan reports." >&2; exit 1; }

echo "$JOBS" | while IFS=: read -r job report; do
  job_id=$(awk -v j="$job" '$1 == j { print $2 }' pipeline_jobs.txt)
  # Not every job exists in every pipeline (e.g. container scanning only runs on trigger pipelines).
  [ -n "$job_id" ] || continue
  current="current-$job.json"
  if ! api -o "$current" "$CI_API_V4_URL/projects/$CI_PROJECT_ID/jobs/$job_id/artifacts/$report"; then
    echo "No $report in job $job; skipping."
    continue
  fi
  base="baseline/$job.json"
  url="$CI_API_V4_URL/projects/$CI_PROJECT_ID/jobs/artifacts/$CI_DEFAULT_BRANCH/raw/$report?job=$job"
  if ! api -o "$base" "$url"; then
    echo "No baseline for $job on $CI_DEFAULT_BRANCH; treating its findings as new."
    echo '{"vulnerabilities":[]}' > "$base"
  fi
  jq -c --arg job "$job" --slurpfile base "$base" '
    ($base[0].vulnerabilities // [] | map(.id)) as $known
    | (.vulnerabilities // [])[]
    | select(.severity == "Critical")
    | select(.id as $id | $known | index($id) | not)
    | (.identifiers // [])[0] as $ident
    | {job: $job, severity: (.severity // "Unknown"),
       # Container/dependency findings carry no name; fall back to "<CVE> in <package>".
       name: (.name // .message
              // (if $ident then "\($ident.value) in \(.location.dependency.package.name // .location.file // "unknown")" else null end)
              // "unnamed finding"),
       url: ($ident.url // null),
       location: (.location.file // .location.image // .location.dependency.package.name // "")}
  ' "$current" >> new_findings.jsonl
done

count=$(wc -l < new_findings.jsonl | tr -d ' ')
if [ "$count" -eq 0 ]; then
  echo "No new vulnerabilities."
  exit 0
fi

if [ -n "${CI_MERGE_REQUEST_IID:-}" ]; then
  mr_url="${CI_MERGE_REQUEST_PROJECT_URL:-$CI_PROJECT_URL}/-/merge_requests/$CI_MERGE_REQUEST_IID"
  context="<$mr_url|MR !$CI_MERGE_REQUEST_IID: $CI_MERGE_REQUEST_SOURCE_BRANCH_NAME>"
else
  context="<$CI_PROJECT_URL/-/tree/$CI_COMMIT_REF_NAME|$CI_COMMIT_REF_NAME>"
fi
commit="<$CI_PROJECT_URL/-/commit/$CI_COMMIT_SHA|${CI_COMMIT_SHORT_SHA}>"

# Cap the list so the message stays readable. Link each finding to its CVE page
# when known; strip characters that would break Slack's <url|text> syntax.
details=$(jq -rs '.[:15][]
  | (.name | gsub("[<>|]"; "")) as $n
  | "• \(if .url then "<\(.url)|\($n)>" else $n end) (`\(.location)`, \(.job))"' new_findings.jsonl)

text=$(printf ':rotating_light: *%s*\n*%s new critical vulnerabilit%s*\n:twisted_rightwards_arrows: *Branch:* *%s* (commit %s)\n%s\n<%s|Pipeline> · <%s/-/security/vulnerability_report/|Vulnerability report>' \
  "$CI_PROJECT_PATH" "$count" "$([ "$count" -eq 1 ] && echo y || echo ies)" "$context" "$commit" "$details" \
  "$CI_PIPELINE_URL" "$CI_PROJECT_URL")

jq -n --arg text "$text" '{text: $text}' \
  | curl -sSf -X POST -H 'Content-type: application/json' --data @- "$SLACK_WEBHOOK_URL"
echo "Notified Slack of $count new finding(s)."
