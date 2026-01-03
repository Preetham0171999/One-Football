"""Database seeding helper.

This project previously seeded initial teams/players/metrics from JSON files in
`football-backend/data`. Those files have been removed.

If you still need seeding, reintroduce a supported data source (e.g. SQL
migrations, admin upload, or a new seed dataset) and implement it here.
"""


def main() -> None:
    print(
        "No seed data present (JSON seed dataset removed). "
        "Nothing to seed."
    )


if __name__ == "__main__":
    main()
