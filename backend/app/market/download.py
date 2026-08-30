from app.market.provider import YFinanceMarketDataProvider


def main() -> None:
    result = YFinanceMarketDataProvider()._download()
    print(f"Cached {len(result.prices)} {result.symbol if hasattr(result, 'symbol') else '^NSEI'} observations through {result.latest_market_date}")


if __name__ == "__main__":
    main()
