# Future personalization schema

This is a design contract only. FinSync does not currently persist these events or train from submitted profiles.

Any future implementation requires explicit, revocable user consent and purpose-limited retention. Candidate records are `profile_versions`, `approved_strategy_changes`, `rejected_strategy_changes`, `goal_updates`, `risk_preference_changes`, and `user_feedback`. Every record should include an opaque user identifier, event timestamp, schema version, consent record, source, and deletion status.

The prototype does not learn immediately from an individual, silently collect activity, automatically retrain, or add submitted financial profiles to training data. Future retraining would require a reviewed, de-identified, consented dataset; documented quality and bias checks; model versioning; and an explicit deployment approval.
