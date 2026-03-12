"use client";

import React, { useState } from "react";
import emailjs from "@emailjs/browser";

interface ContactModalProps {
  onClose: () => void;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          title: subject,
          message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      );
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {status === "success" ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">문의가 접수되었습니다!</h3>
            <p className="text-sm text-gray-500 mb-6">빠른 시일 내에 확인하겠습니다.</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">문의하기</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="문의 제목을 입력해주세요."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  문의 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="문의하실 내용을 자유롭게 적어주세요."
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-500">
                  전송에 실패했습니다. 잠시 후 다시 시도해 주세요.
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={status === "loading" || !subject || !message}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  {status === "loading" ? "전송 중..." : "문의 보내기"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
