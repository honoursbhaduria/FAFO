import os
import re

replacements = [
    (r'\bbg-blue-600\b', 'bg-brand-600'),
    (r'\btext-blue-600\b', 'text-brand-600'),
    (r'\bborder-blue-600\b', 'border-brand-600'),
    (r'\bbg-slate-900\b', 'bg-brand-600'),
    (r'\bbg-blue-50\b', 'bg-brand-50'),
    (r'\btext-blue-500\b', 'text-brand-500'),
    (r'\bbg-blue-700\b', 'bg-brand-700'),
    (r'\bhover:bg-blue-700\b', 'hover:bg-brand-700'),
    (r'\bhover:bg-blue-600\b', 'hover:bg-brand-500'),
    (r'\bfocus:ring-blue-500\b', 'focus:ring-brand-500'),
    (r'\bshadow-blue-600\b', 'shadow-brand-600'),
    (r'\bshadow-blue-200\b', 'shadow-brand-100'),
    (r'\bborder-blue-500\b', 'border-brand-500'),
    (r'\bbg-blue-500\b', 'bg-brand-500'),
    (r'\btext-blue-700\b', 'text-brand-700'),
    (r'\btext-blue-100\b', 'text-brand-100'),
    (r'\bbg-blue-100\b', 'bg-brand-100'),
    (r'\bborder-blue-100\b', 'border-brand-100'),
    (r'\bshadow-slate-900\b', 'shadow-brand-600'),
    (r'\bfrom-slate-900\b', 'from-brand-600'),
    (r'\bto-slate-900\b', 'to-brand-600'),
    (r'\bvia-slate-900\b', 'via-brand-600'),
    (r'\bring-blue-600\b', 'ring-brand-600'),
    (r'\bfrom-blue-600\b', 'from-brand-600'),
    (r'\bto-blue-600\b', 'to-brand-600'),
    (r'\bvia-blue-700\b', 'via-brand-700'),
]

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        new_content = re.sub(old, new, new_content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    src_dir = 'web/src'
    updated_files = []
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                file_path = os.path.join(root, file)
                if update_file(file_path):
                    updated_files.append(file_path)
    
    print(f"Updated {len(updated_files)} files.")
    for f in updated_files:
        print(f"  {f}")

if __name__ == "__main__":
    main()
