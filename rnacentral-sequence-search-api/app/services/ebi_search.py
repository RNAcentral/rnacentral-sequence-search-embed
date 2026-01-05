import asyncio
import httpx
from typing import Optional
from app.config import get_settings
from app.models.job import Facet, FacetValue, SearchHit


settings = get_settings()

# Facet fields to request from EBI Search
FACET_FIELDS = [
    "length",
    "rna_type",
    "TAXONOMY",
    "expert_db",
    "qc_warning_found",
    "has_go_annotations",
    "has_conserved_structure",
    "has_genomic_coordinates",
    "popular_species",
]

# Facet ordering for display
FACET_ORDER = [
    "rna_type",
    "TAXONOMY",
    "expert_db",
    "qc_warning_found",
    "has_go_annotations",
    "has_conserved_structure",
    "has_genomic_coordinates",
    "popular_species",
    "length",
]


class EbiSearchService:
    """Service for fetching facets from EBI Search."""

    def __init__(self):
        self.base_url = settings.ebi_search_base_url

    async def fetch_facets_for_ids(
        self,
        rnacentral_ids: list[str],
        filter_query: Optional[str] = None,
        batch_size: int = 50
    ) -> list[Facet]:
        """
        Fetch facets for a list of RNAcentral IDs.
        Uses batched requests to avoid URL length limits.
        """
        if not rnacentral_ids:
            return []

        # Split IDs into batches
        batches = [
            rnacentral_ids[i:i + batch_size]
            for i in range(0, len(rnacentral_ids), batch_size)
        ]

        # Fetch all batches in parallel
        tasks = [
            self._fetch_facets_batch(batch, filter_query)
            for batch in batches
        ]
        results = await asyncio.gather(*tasks)

        # Merge facets from all batches
        return self._merge_facets(results)

    async def fetch_matching_ids(
        self,
        rnacentral_ids: list[str],
        filter_query: str,
        batch_size: int = 50
    ) -> set[str]:
        """
        Fetch the subset of RNAcentral IDs that match a filter query.
        Uses batched requests to avoid URL length limits.
        """
        if not rnacentral_ids or not filter_query:
            return set(rnacentral_ids)

        # Split IDs into batches
        batches = [
            rnacentral_ids[i:i + batch_size]
            for i in range(0, len(rnacentral_ids), batch_size)
        ]

        # Fetch all batches in parallel
        tasks = [
            self._fetch_matching_ids_batch(batch, filter_query)
            for batch in batches
        ]
        results = await asyncio.gather(*tasks)

        # Combine all matching IDs
        matching_ids = set()
        for batch_ids in results:
            matching_ids.update(batch_ids)

        return matching_ids

    async def _fetch_facets_batch(
        self,
        rnacentral_ids: list[str],
        filter_query: Optional[str]
    ) -> Optional[list[dict]]:
        """Fetch facets for a batch of IDs."""
        ids_query = "(" + " OR ".join(f'id:"{id}"' for id in rnacentral_ids) + ")"

        query = ids_query
        if filter_query:
            query = f"{ids_query} AND {filter_query}"

        params = {
            "query": query,
            "format": "json",
            "fields": "",
            "facetcount": 100,
            "facetfields": ",".join(FACET_FIELDS),
            "start": 0,
            "size": 0,  # We only need facets, not entries
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(self.base_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("facets", [])
                return None
            except Exception:
                return None

    async def _fetch_matching_ids_batch(
        self,
        rnacentral_ids: list[str],
        filter_query: str
    ) -> set[str]:
        """Fetch matching IDs for a batch."""
        ids_query = "(" + " OR ".join(f'id:"{id}"' for id in rnacentral_ids) + ")"
        query = f"{ids_query} AND {filter_query}"

        params = {
            "query": query,
            "format": "json",
            "fields": "",
            "start": 0,
            "size": len(rnacentral_ids),
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(self.base_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    entries = data.get("entries", [])
                    return {entry["id"] for entry in entries}
                return set()
            except Exception:
                return set()

    def _merge_facets(self, facet_lists: list[Optional[list[dict]]]) -> list[Facet]:
        """Merge facets from multiple batches by summing counts."""
        merged = {}

        for facets in facet_lists:
            if not facets:
                continue

            for facet in facets:
                facet_id = facet.get("id")
                if not facet_id:
                    continue

                if facet_id not in merged:
                    merged[facet_id] = {
                        "id": facet_id,
                        "label": facet.get("label", facet_id),
                        "total": 0,
                        "facetValues": {},
                    }

                # Merge facet values by summing counts
                for fv in facet.get("facetValues", []):
                    value = fv.get("value")
                    if not value:
                        continue

                    if value not in merged[facet_id]["facetValues"]:
                        merged[facet_id]["facetValues"][value] = {
                            "label": fv.get("label", value),
                            "value": value,
                            "count": 0,
                        }
                    merged[facet_id]["facetValues"][value]["count"] += fv.get("count", 0)

        # Convert to Facet objects and sort
        facets = []
        for facet_data in merged.values():
            facet_values = sorted(
                facet_data["facetValues"].values(),
                key=lambda fv: fv["count"],
                reverse=True
            )
            facets.append(Facet(
                id=facet_data["id"],
                label=facet_data["label"],
                total=facet_data["total"],
                facetValues=[FacetValue(**fv) for fv in facet_values]
            ))

        # Sort facets according to predefined order
        def facet_sort_key(f: Facet) -> int:
            try:
                return FACET_ORDER.index(f.id)
            except ValueError:
                return len(FACET_ORDER)

        facets.sort(key=facet_sort_key)

        # Merge popular_species into TAXONOMY
        popular_idx = next((i for i, f in enumerate(facets) if f.id == "popular_species"), None)
        taxonomy_idx = next((i for i, f in enumerate(facets) if f.id == "TAXONOMY"), None)

        if popular_idx is not None and taxonomy_idx is not None:
            popular = facets[popular_idx]
            taxonomy = facets[taxonomy_idx]

            existing_values = {fv.value for fv in taxonomy.facetValues}
            new_values = [fv for fv in popular.facetValues if fv.value not in existing_values]
            taxonomy.facetValues = new_values + taxonomy.facetValues

            # Remove popular_species facet
            facets.pop(popular_idx)

        return facets

    def build_filter_query(
        self,
        selected_facets: dict[str, list[str]],
        text_filter: Optional[str] = None
    ) -> Optional[str]:
        """Build an EBI Search query from selected facets."""
        clauses = []

        for facet_id, values in selected_facets.items():
            if values:
                value_clauses = [f'{facet_id}:"{v}"' for v in values]
                clauses.append("(" + " OR ".join(value_clauses) + ")")

        if text_filter:
            clauses.append(f"({text_filter})")

        if clauses:
            return " AND ".join(clauses)
        return None

    def filter_hits_by_ids(
        self,
        hits: list[SearchHit],
        matching_ids: set[str]
    ) -> list[SearchHit]:
        """Filter search hits to only those with matching IDs."""
        filtered = [h for h in hits if h.rnacentral_id in matching_ids]
        # Re-assign IDs
        for i, hit in enumerate(filtered):
            hit.id = i
        return filtered
