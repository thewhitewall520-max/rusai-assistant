# GitHub 仓库清理检查清单

## 已完成的清理

- [x] 删除敏感文件 (.env, dev.db)
- [x] 更新 .gitignore
- [x] 重构项目结构
- [x] 添加 Docker 配置
- [x] 添加 CI/CD 配置

## 还需要清理的文件

检查仓库中是否还有以下文件：

```bash
# 检查敏感文件
git ls-files | grep -E "\.env|\.db|secret|key|password"

# 检查大文件
git ls-files | xargs -I {} sh -c 'du -h {}' | sort -rh | head -20

# 检查旧配置
git ls-files | grep -E "old|backup|temp|test"
```

## 清理步骤

### 1. 删除历史中的敏感文件

```bash
# 从 Git 历史中完全删除 .env
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env' \
--prune-empty --tag-name-filter cat -- --all

# 从 Git 历史中完全删除 dev.db
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch dev.db' \
--prune-empty --tag-name-filter cat -- --all

# 强制推送到远程
git push origin --force --all
```

### 2. 清理旧分支

```bash
# 查看所有分支
git branch -a

# 删除本地旧分支
git branch -d old-branch-name

# 删除远程旧分支
git push origin --delete old-branch-name
```

### 3. 清理 Git 历史

```bash
# 运行垃圾回收
git gc --aggressive --prune=now

# 清理 reflog
git reflog expire --expire=now --all
```

### 4. 验证清理

```bash
# 检查是否还有敏感文件
git log --all --full-history -- .env
git log --all --full-history -- dev.db

# 应该没有输出
```

## 清理后的仓库结构

```
rusai-assistant/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── frontend/
│   └── backend/
├── infra/
│   ├── docker/
│   └── nginx/
├── docs/
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

## 提交清理

```bash
git add .
git commit -m "chore: cleanup repository

- Remove sensitive files from history
- Clean old branches
- Optimize repository size
- Update .gitignore"

git push origin main
```