
import { useState } from "react";
import { User } from "lucide-react";

interface NameInputProps {
  onNameSet: (name: string) => void;
}

const NameInput = ({ onNameSet }: NameInputProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSet(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-orange-100 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-pink-100">
        <div className="text-center mb-6">
          {/* HCHAT Logo */}
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl font-bold text-white">H</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Join HCHAT
          </h1>
          <p className="text-gray-600">Enter your name to start chatting</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-purple-400 focus:outline-none transition-all duration-300 focus:shadow-lg focus:shadow-purple-200/50"
              autoFocus
              maxLength={20}
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start Chatting
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameInput;
