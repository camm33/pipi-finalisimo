import React, { useState } from "react";
import './ChatModal.css';
import ChatList from "./ChatList";
import Chat from "./Chat";

export default function ChatModal({ open, onClose, id_destinatario, destinatarioInfo }) {
  const [showChatList, setShowChatList] = useState(false);
  
  if (!open) return null;
  return (
    <div className="chat-modal-overlay" onClick={onClose}>
  <div className="chat-modal" onClick={e => e.stopPropagation()} style={{maxHeight:'80vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
        {/* Equís eliminada, solo contenido del chat/modal */}
        {showChatList ? (
          <ChatList onClose={onClose} />
        ) : (
          id_destinatario ? (
            <Chat id_destinatario={id_destinatario} destinatarioInfo={destinatarioInfo} onBack={() => setShowChatList(true)} />
          ) : (
            <ChatList onClose={onClose} />
          )
        )}
      </div>
    </div>
  );
}