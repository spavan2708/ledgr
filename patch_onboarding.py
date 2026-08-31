import os
import re

file_path = 'frontend/src/components/onboarding/OnboardingForm.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Update STEP_LABELS
code = code.replace('const STEP_LABELS = ["About You", "Monthly Cash Flow", "What You Own", "What You Owe & Safety", "Risk & Investment Behaviour"];', 'const STEP_LABELS = ["About You", "Monthly Cash Flow", "What You Owe & Safety", "Risk & Investment Behaviour"];')

# Update step < 4 to step < 3 in continueStep
code = re.sub(r'if \(step < 4\) {', 'if (step < 3) {', code)

# Update setLastOnboardingStep(4) to 3
code = code.replace('setLastOnboardingStep(4);', 'setLastOnboardingStep(3);')
code = code.replace('if (!isNaN(parsed) && parsed >= 0 && parsed <= 4) {', 'if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) {')

# Find the block for step 2 (What You Own) and remove it entirely.
# The block starts with {/* -- STEP 3 - What You Own -- */}
import re
step2_pattern = re.compile(r'\{\/\* [^\n]*STEP 3 - What You Own[^\n]*\*\/\}\n\s*\{step === 2 && <>\n(.*?)\s*</>\}\n', re.DOTALL)
code = step2_pattern.sub('', code)

# Renumber step === 3 to step === 2
code = code.replace('{step === 3 && <>', '{step === 2 && <>')
code = code.replace('eyebrow="Step 4 of 5"', 'eyebrow="Step 3 of 4"')

# Renumber step === 4 to step === 3
code = code.replace('{step === 4 && <>', '{step === 3 && <>')
code = code.replace('eyebrow="Step 5 of 5"', 'eyebrow="Step 4 of 4"')

# Update the header counts
code = code.replace('eyebrow="Step 1 of 5"', 'eyebrow="Step 1 of 4"')
code = code.replace('eyebrow="Step 2 of 5"', 'eyebrow="Step 2 of 4"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("done")
