import sys
import json
import os
from predict import RiskPredictor

def main():
    try:
        # Read JSON string from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
            
        profile_dict = json.loads(input_data)
        
        # Determine model path based on script execution dir
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_dir = os.path.join(script_dir, "..", "models")
        
        predictor = RiskPredictor(model_dir=model_dir)
        result = predictor.predict(profile_dict)
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
