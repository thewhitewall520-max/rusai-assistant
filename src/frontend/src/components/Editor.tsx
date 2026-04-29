import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Document {
  id?: string;
  title: string;
  content: string;
  type: string;
  language: string;
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document>({
    title: '',
    content: '',
    type: 'general',
    language: 'zh',
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 加载文档
  useEffect(() => {
    if (id) {
      fetchDocument(id);
    }
  }, [id]);

  // 自动保存
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.content && !saving) {
        autoSave();
      }
    }, 30000); // 30秒自动保存

    return () => clearInterval(timer);
  }, [document, saving]);

  const fetchDocument = async (docId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      }
    } catch (error) {
      console.error('Failed to fetch document:', error);
    }
  };

  const autoSave = useCallback(async () => {
    if (!document.title && !document.content) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/documents/${id}` : '/api/documents';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(document),
      });

      if (response.ok) {
        const data = await response.json();
        setLastSaved(new Date());
        
        if (!id && data.id) {
          navigate(`/editor/${data.id}`);
        }
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [document, id, navigate]);

  const handleSave = async () => {
    await autoSave();
  };

  const handleAIAssist = async () => {
    // TODO: 集成 Kimi AI
    alert('AI 辅助功能开发中...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={document.title}
            onChange={(e) => setDocument({ ...document, title: e.target.value })}
            placeholder="文档标题"
            className="text-xl font-semibold border-none outline-none bg-transparent"
          />
          {saving && <span className="text-sm text-gray-500">保存中...</span>}
          {lastSaved && !saving && (
            <span className="text-sm text-green-500">
              已保存 {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={document.type}
            onChange={(e) => setDocument({ ...document, type: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-lg"
          >
            <option value="general">通用</option>
            <option value="email">邮件</option>
            <option value="essay">论文</option>
            <option value="translation">翻译</option>
          </select>

          <select
            value={document.language}
            onChange={(e) => setDocument({ ...document, language: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-lg"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>

          <button
            onClick={handleAIAssist}
            className="px-4 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            🤖 AI 辅助
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <textarea
          value={document.content}
          onChange={(e) => setDocument({ ...document, content: e.target.value })}
          placeholder="开始写作..."
          className="w-full h-[calc(100vh-200px)] p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* 底部状态栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between text-sm text-gray-500">
        <span>
          字数: {document.content.length} | 
          字符: {document.content.split('').length}
        </span>
        <span>
          类型: {document.type} | 
          语言: {document.language}
        </span>
      </div>
    </div>
  );
}