import os
import re

file_path = 'frontend/src/app/(app)/profile/review/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Make onEdit optional
code = code.replace('{ title: string; onEdit: () => void; children: ReactNode }', '{ title: string; onEdit?: () => void; children: ReactNode }')
code = code.replace('<button type="button" onClick={onEdit} className="text-xs font-semibold text-slate-400 transition-colors hover:text-emerald-300">Edit</button>', '{onEdit && <button type="button" onClick={onEdit} className="text-xs font-semibold text-slate-400 transition-colors hover:text-emerald-300">Edit</button>}')

# Update "What You Own"
code = code.replace('<ReviewSection title="What You Own" onEdit={() => onEdit(2)}>', '<ReviewSection title="What You Own">')

# Shift indices for Liabilities and Risk
code = code.replace('onEdit={() => onEdit(3)}', 'onEdit={() => onEdit(2)}')
code = code.replace('onEdit={() => onEdit(4)}', 'onEdit={() => onEdit(3)}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("done")
