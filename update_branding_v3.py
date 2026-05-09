import os
import re

replacements = [
    (r'\bhover:border-blue-400\b', 'hover:border-brand-500'),
    (r'\bborder-blue-50\b', 'border-brand-50'),
    (r'\bshadow-blue-100\b', 'shadow-brand-100'),
    (r'\bborder-blue-200\b', 'border-brand-100'),
]

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        pattern = old.replace(r'\b', r'')
        full_pattern = r'\b' + pattern + r'(/\d+)?\b'
        
        def replace_func(match):
            base = new
            opacity = match.group(1) if match.group(1) else ''
            return base + opacity

        new_content = re.sub(full_pattern, replace_func, new_content)
    
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

if __name__ == "__main__":
    main()
