# RNAcentral databases available for sequence search
# These are the actual database IDs used by the Job Dispatcher API
# Note: Some databases have multiple shards (e.g., ena-0 through ena-120)
# For initial implementation, we use only the first shard (-0) of each database

RNACENTRAL_DATABASES = [
    "5srrnadb-0",
    "crw-0",
    "dictybase-0",
    "ena-0",
    "ensembl-0",
    "ensembl_fungi-0",
    "ensembl_gencode-0",
    "ensembl_metazoa-0",
    "ensembl_plants-0",
    "ensembl_protists-0",
    "evlncrnas-0",
    "expression_atlas-0",
    "flybase-0",
    "genecards-0",
    "greengenes-0",
    "gtrnadb-0",
    "hgnc-0",
    "intact-0",
    "lncbase-0",
    "lncbook-0",
    "lncipedia-0",
    "lncrnadb-0",
    "malacards-0",
    "mgi-0",
    "mgnify-0",
    "mirbase-0",
    "mirgenedb-0",
    "modomics-0",
    "noncode-0",
    "pdbe-0",
    "pirbase-0",
    "plncdb-0",
    "pombase-0",
    "psicquic-0",
    "rdp-0",
    "refseq-0",
    "rfam-0",
    "rgd-0",
    "ribocentre-0",
    "ribovision-0",
    "silva-0",
    "snodb-0",
    "snopy-0",
    "snorna_database-0",
    "srpdb-0",
    "tair-0",
    "tarbase-0",
    "tmrna_web-0",
    "wormbase-0",
    "zfin-0",
    "zwd-0",
]


def get_database_ids() -> list[str]:
    """Get list of all database IDs."""
    return RNACENTRAL_DATABASES
