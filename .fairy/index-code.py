#!/usr/bin/env python3
"""
代码索引生成器 - 妖精尾巴公会
扫描项目文件，提取函数/类/组件/配置的关键信息
输出到 .fairy/code-index/{project}/index.json
"""

import os, re, json, sys

def scan_js(code, filepath):
    """提取 JS 函数、类、关键变量"""
    items = []
    lines = code.split('\n')
    for i, line in enumerate(lines):
        line_num = i + 1
        # 函数定义
        m = re.match(r'^\s*(?:async\s+)?function\s+(\w+)', line)
        if m:
            items.append({'type': 'function', 'name': m.group(1), 'line': line_num, 'file': filepath})
            continue
        # 箭头函数赋值
        m = re.match(r'^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(', line)
        if m:
            items.append({'type': 'function', 'name': m.group(1), 'line': line_num, 'file': filepath})
            continue
        # Class
        m = re.match(r'^\s*(?:export\s+)?class\s+(\w+)', line)
        if m:
            items.append({'type': 'class', 'name': m.group(1), 'line': line_num, 'file': filepath})
            continue
        # 关键配置变量 (大写常量)
        m = re.match(r'^\s*(?:const|let|var)\s+([A-Z_]{3,})\s*=', line)
        if m:
            items.append({'type': 'config', 'name': m.group(1), 'line': line_num, 'file': filepath})
    return items

def scan_html(code, filepath):
    """提取 HTML 的关键元素"""
    items = []
    lines = code.split('\n')
    for i, line in enumerate(lines):
        line_num = i + 1
        # id 定义
        for m in re.finditer(r'id="(\w+)"', line):
            items.append({'type': 'element', 'name': m.group(1), 'line': line_num, 'file': filepath})
        # 函数定义在 script 中
    # 也扫 script 里的函数
    scripts = re.findall(r'<script>(.*?)</script>', code, re.DOTALL)
    for s in scripts:
        items.extend(scan_js(s, filepath))
    return items

def scan_file(filepath):
    """扫描单个文件"""
    ext = os.path.splitext(filepath)[1].lower()
    try:
        with open(filepath) as f:
            code = f.read()
    except:
        return []
    
    if ext in ('.js', '.mjs', '.cjs'):
        return scan_js(code, filepath)
    elif ext in ('.html', '.htm'):
        return scan_html(code, filepath)
    elif ext in ('.css', '.scss'):
        return []  # CSS 暂不索引
    elif ext in ('.json',):
        return [{'type': 'config', 'name': os.path.basename(filepath), 'line': 0, 'file': filepath}]
    return []

def build_index(project_dir):
    """为项目构建索引"""
    project_name = os.path.basename(os.path.normpath(project_dir))
    index = {
        'project': project_name,
        'path': project_dir,
        'functions': [],
        'elements': [],
        'configs': [],
        'classes': [],
        'raw': [],
        'updatedAt': '',
    }
    
    for root, dirs, files in os.walk(project_dir):
        # 跳过 node_modules, .git, .next, .fairy
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', '.next', '.fairy', '__pycache__')]
        for fname in files:
            fpath = os.path.join(root, fname)
            relpath = os.path.relpath(fpath, project_dir)
            items = scan_file(fpath)
            for item in items:
                item['file'] = relpath
                entry = {'name': item['name'], 'file': relpath, 'line': item['line']}
                if item['type'] == 'function':
                    index['functions'].append(entry)
                elif item['type'] == 'class':
                    index['classes'].append(entry)
                elif item['type'] == 'config':
                    index['configs'].append(entry)
                elif item['type'] == 'element':
                    index['elements'].append(entry)
                index['raw'].append(item)
    
    index['updatedAt'] = __import__('datetime').datetime.now().strftime('%Y-%m-%dT%H:%M:%S+08:00')
    return index

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else '.'
    index = build_index(target)
    
    # 保存索引
    fairy_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'code-index', index['project'])
    os.makedirs(fairy_dir, exist_ok=True)
    outpath = os.path.join(fairy_dir, 'index.json')
    with open(outpath, 'w') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f'✅ 索引已生成: {outpath}')
    print(f'   函数: {len(index["functions"])}  类: {len(index["classes"])}  元素: {len(index["elements"])}  配置: {len(index["configs"])}')
