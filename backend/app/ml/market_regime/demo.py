import json

from app.ml.market_regime.inference import MarketRegimeService


if __name__ == "__main__":
    print(json.dumps(MarketRegimeService().predict_latest("demo").model_dump(), indent=2))
