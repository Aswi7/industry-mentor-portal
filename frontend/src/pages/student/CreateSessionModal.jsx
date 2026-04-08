import { useState } from "react";
import { 
  X, 
  Clock, 
  Users, 
  CreditCard, 
  Tag, 
  AlertCircle,
  Type,
  AlignLeft,
  ChevronDown,
  Sparkles
} from "lucide-react";

const CreateSessionModal = ({
  onClose,
  onCreate,
}) => {
  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [maxStudents, setMaxStudents] = useState("5");
  const [type, setType] = useState("FREE");
  const [price, setPrice] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-add current skillInput if not empty
    let currentSkills = [...skills];
    if (skillInput.trim() && !currentSkills.includes(skillInput.trim())) {
      currentSkills.push(skillInput.trim());
    }

    if (currentSkills.length === 0) {
      alert("Please add at least one skill or topic.");
      return;
    }
    const sessionData = {
      title,
      description,
      skills: currentSkills,
      date,
      time,
      duration,
      maxStudents,
      type,
      price: type === "PAID" ? Number(price || 0) : 0,
    };
    if (onCreate) {
      await onCreate(sessionData);
      return;
    }
    onClose();
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillInputKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
      setSkillInput("");
    }
  };

  return (
    <div className="fixed inset-0 bg-primary-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500 font-display text-primary-900">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[92vh] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-white/20 overflow-y-auto relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 custom-scrollbar">
        
        {/* Glow Decor */}
        <div className="sticky top-0 left-0 right-0 z-50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-sm"></div>
          <div className="h-2 bg-white/80 backdrop-blur-sm"></div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30 rotate-3">
                <Sparkles size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter">New <span className="text-blue-600">Session</span></h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-1 text-left">Mentor Portal • Scheduler</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all group border border-gray-100"
            >
              <X size={24} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title & Description */}
            <div className="space-y-5">
              <div className="relative group">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 block ml-1 text-left">Headline</label>
                <div className="relative">
                  <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-extrabold placeholder:text-gray-300 shadow-inner group-hover:bg-gray-100/50"
                    placeholder="e.g. Senior Architecture Review"
                    required
                  />
                </div>
              </div>

              <div className="relative group text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">Context & Outcome</label>
                <div className="relative">
                  <AlignLeft className="absolute left-5 top-6 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold placeholder:text-gray-300 resize-none shadow-inner group-hover:bg-gray-100/50"
                    rows={3}
                    placeholder="Describe the learning goals..."
                  />
                </div>
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-1">Schedule Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-black shadow-inner group-hover:bg-gray-100/50"
                  required
                />
              </div>
              <div className="space-y-2 group text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-1">Kickoff Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-black shadow-inner group-hover:bg-gray-100/50"
                  required
                />
              </div>
            </div>

            {/* Skills / Tags */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-1">Key Topics & Tags</label>
              <div className="flex flex-wrap gap-2.5 p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[1.5rem] transition-all group-focus-within:border-blue-500 group-focus-within:bg-white">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-primary-900 text-white pl-4 pr-3 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-lg shadow-primary-900/20 animate-in zoom-in-90 duration-300"
                  >
                    #{skill.toUpperCase()}
                    <button type="button" onClick={() => removeSkill(skill)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))}
                <div className="flex items-center flex-1 min-w-[120px] px-2">
                  <Tag size={16} className="text-gray-300 mr-3" />
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillInputKey}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-black py-1 placeholder:text-gray-300 uppercase"
                    placeholder={skills.length === 0 ? "Add tags..." : ""}
                  />
                </div>
              </div>
            </div>

            {/* Config & Type Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start pt-4">
              {/* Duration & Capacity */}
              <div className="space-y-6 px-2">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 text-gray-400 group-hover:text-primary-900 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Clock size={16} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
                  </div>
                  <div className="relative">
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="appearance-none bg-white border-2 border-gray-100 rounded-xl pl-4 pr-10 py-2 text-xs font-black text-primary-900 focus:border-blue-500 outline-none cursor-pointer shadow-sm hover:border-gray-300 transition-all"
                    >
                      <option value="30">30 MIN</option>
                      <option value="45">45 MIN</option>
                      <option value="60">60 MIN</option>
                      <option value="90">90 MIN</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 text-gray-400 group-hover:text-primary-900 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Users size={16} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Capacity</span>
                  </div>
                  <div className="relative">
                    <select
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(e.target.value)}
                      className="appearance-none bg-white border-2 border-gray-100 rounded-xl pl-4 pr-10 py-2 text-xs font-black text-primary-900 focus:border-blue-500 outline-none cursor-pointer shadow-sm hover:border-gray-300 transition-all"
                    >
                      {[1, 3, 5, 10, 20].map(num => <option key={num} value={num}>{num} SEATS</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Type & Pricing */}
              <div className="bg-primary-900 p-6 rounded-[2rem] shadow-xl shadow-primary-900/20 text-white relative overflow-hidden text-left">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <CreditCard size={18} className="text-blue-400" />
                    <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em]">Pricing Strategy</span>
                  </div>
                  
                  <div className="flex gap-2 p-1 bg-white/10 rounded-[1.25rem] mb-5">
                    <button
                      type="button"
                      onClick={() => setType("FREE")}
                      className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black transition-all ${
                        type === "FREE" ? "bg-white text-primary-900 shadow-lg" : "text-white/60 hover:text-white"
                      }`}
                    >
                      FREE
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("PAID")}
                      className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black transition-all ${
                        type === "PAID" ? "bg-white text-primary-900 shadow-lg" : "text-white/60 hover:text-white"
                      }`}
                    >
                      PAID
                    </button>
                  </div>

                  {type === "PAID" && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex-1 relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-900 font-black text-sm">₹</span>
                        <input
                          type="number"
                          min="1"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full pl-10 pr-6 py-3.5 bg-white border-none rounded-[1.25rem] outline-none text-sm font-black text-primary-900 shadow-2xl focus:ring-4 focus:ring-blue-500/30 transition-all"
                          placeholder="0.00"
                          required={type === "PAID"}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {/* Abstract pattern bg */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-10 border-t border-gray-100 mt-6 gap-6">
              <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 rounded-2xl border border-blue-100">
                <AlertCircle size={18} className="text-blue-600" />
                <span className="text-[10px] font-bold text-blue-700 leading-tight text-left">Google Meet integration is active.<br/>Link will be auto-generated.</span>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-8 py-4 text-xs font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] text-xs font-black shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Publish Now
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSessionModal;
