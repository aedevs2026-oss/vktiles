"""Shared constants for VK PDF catalog extraction."""
from __future__ import annotations

BRAND = "VK Tiles & Granites"

FEATURES = [
    "Low Water Absorption",
    "High Breaking Strength",
    "Frost Resistant",
    "Stain Resistant",
    "Easy Maintenance",
    "ISO 9001:2015 Certified",
]

APPLICATIONS = {
    "gvt-pgvt": ["Living Room", "Bedroom", "Commercial Spaces", "Hotels", "Office"],
    "wooden-strip": ["Living Room", "Bedroom", "Commercial Spaces"],
    "wall-tiles": ["Bathroom", "Kitchen", "Living Room", "Bedroom", "Accent Walls"],
    "elevation-tiles": ["Building Facade", "Exterior Walls", "Commercial Elevation"],
    "parking-tiles": ["Parking Areas", "Driveways", "Commercial Outdoor"],
}

PACKING_DEFAULTS = {
    "300x450 MM": {"thickness": "7.5 MM", "tilesPerBox": 6, "coverage": "0.81 SQM", "weight": "16 KG"},
    "300x600 MM": {"thickness": "9 MM", "tilesPerBox": 5, "coverage": "0.90 SQM", "weight": "18 KG"},
    "400x400 MM": {"thickness": "8 MM", "tilesPerBox": 5, "coverage": "0.80 SQM", "weight": "18 KG"},
    "600x600 MM": {"thickness": "9 MM", "tilesPerBox": 4, "coverage": "1.44 SQM", "weight": "28 KG"},
    "600x900 MM": {"thickness": "8 MM", "tilesPerBox": 3, "coverage": "1.62 SQM", "weight": "24 KG"},
    "600x1200 MM": {"thickness": "9 MM", "tilesPerBox": 2, "coverage": "1.44 SQM", "weight": "30 KG"},
    "800x1600 MM": {"thickness": "9 MM", "tilesPerBox": 2, "coverage": "2.56 SQM", "weight": "42 KG"},
    "1200x1800 MM": {"thickness": "9 MM", "tilesPerBox": 1, "coverage": "2.16 SQM", "weight": "38 KG"},
    "1800x1200 MM": {"thickness": "9 MM", "tilesPerBox": 1, "coverage": "2.16 SQM", "weight": "38 KG"},
}

MATERIAL = {
    "gvt-pgvt": "Glazed Vitrified Tile (GVT/PGVT)",
    "wooden-strip": "Porcelain Wood-Look Tile",
    "wall-tiles": "Ceramic Wall Tile",
    "elevation-tiles": "Elevation / High Depth Tile",
    "parking-tiles": "Parking Floor Tile",
}

# Indexed PDF configs for legacy interactive catalogs (optional).
LEGACY_PDF_CONFIGS: dict[str, dict] = {
    "MATT.pdf": {
        "series_slug": "matt",
        "collection": "Matt Collection",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Matt",
        "surface": "Matt",
        "pattern": "Random",
    },
    "WOODEN MATT.pdf": {
        "series_slug": "wooden-matt",
        "collection": "Wood Collection",
        "category": "wooden-strip",
        "size": "600x1200 MM",
        "finish": "Matt",
        "surface": "Matt Wood",
        "pattern": "Wood",
    },
    "GLOSSY ENDLESS 1.pdf": {
        "series_slug": "glossy-endless-1",
        "collection": "Glossy Endless",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Endless",
    },
    "GLOSSY ENDLESS 2.pdf": {
        "series_slug": "glossy-endless-2",
        "collection": "Glossy Endless 2",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Endless",
    },
    "GLOSSY RANDOM 1.pdf": {
        "series_slug": "glossy-random-1",
        "collection": "Glossy Random",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
    },
    "GLOSSY RANDOM 2.pdf": {
        "series_slug": "glossy-random-2",
        "collection": "Glossy Random 2",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
    },
    "GLOSSY STAUARIO & ONYX.pdf": {
        "series_slug": "glossy-statuario-onyx",
        "collection": "Glossy Statuario & Onyx",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Marble",
    },
    "HIGH GLOSSY.pdf": {
        "series_slug": "high-glossy",
        "collection": "High Glossy",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
    },
    "NEW GLOSSY 2.pdf": {
        "series_slug": "new-glossy-2",
        "collection": "New Glossy 2",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
    },
    "SUPER HIGH GLOSSY.pdf": {
        "series_slug": "super-high-glossy",
        "collection": "Super High Glossy",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Random",
    },
    "INKY_1.pdf": {
        "series_slug": "inky-1",
        "collection": "Inky Collection",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Inky",
    },
    "INKY_2.pdf": {
        "series_slug": "inky-2",
        "collection": "Inky Collection 2",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Glossy",
        "surface": "Polished",
        "pattern": "Inky",
    },
    "CARVING.pdf": {
        "series_slug": "carving",
        "collection": "Matt Carving",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Matt",
        "surface": "Carving",
        "pattern": "Carving",
    },
    "VALENZA NEW CARVING.pdf": {
        "series_slug": "valenza-new-carving",
        "collection": "Carving Collection",
        "category": "gvt-pgvt",
        "size": "600x1200 MM",
        "finish": "Matt",
        "surface": "Carving",
        "pattern": "Carving",
        "mode": "sequential",
        "start_page": 5,
    },
}

INDEX_MIN_LINKS = 6
MIN_TILE_DIM = 280
MIN_TILE_AREA = 90000
MIN_HERO_AREA = 180000
MAX_ASPECT_RATIO = 1.45
MAX_POSTER_ASPECT_RATIO = 2.15  # poster pages (2x3, 2x4 feet layouts)

SKIP_NAME_TOKENS = frozenset({
    "OUTLOOK", "COLLECTION", "FINISH", "RANDOM", "MATT", "GLOSSY", "HOUSE",
    "OUTDOOR", "TILES", "OF", "FLOOR", "GRES", "PUNCH", "SERIES", "BEST",
    "SELLING", "PRODUCT", "INSIDE", "VALENZA", "VK", "DIGITAL", "PLAIN",
    "SAND", "CARVING", "ENDLESS", "THE", "WOOD", "INKY", "HIGH", "SUPER",
    "NEW", "WL", "GLITTER",
})

CATEGORY_LABELS = {
    "gvt-pgvt": "GVT / PGVT Floor Tiles",
    "wooden-strip": "Wooden Strip",
    "wall-tiles": "Wall Tiles",
    "elevation-tiles": "Elevation Tiles",
    "parking-tiles": "Parking Tiles",
}
