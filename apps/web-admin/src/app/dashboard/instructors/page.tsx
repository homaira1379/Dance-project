"use client";

import React, { useEffect, useState } from "react";
import { Plus, User, Search, MapPin } from "lucide-react";
import { fetchTrainers, createTrainer, type Trainer } from "../../../../lib/trainers";
import { listStudios, type Studio } from "../../../../lib/studios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";

export default function InstructorsPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedStudio, setSelectedStudio] = useState("");
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trainersData, studiosData] = await Promise.all([
        fetchTrainers(),
        listStudios(),
      ]);
      setTrainers(trainersData);
      setStudios(studiosData);
      if (studiosData.length > 0) setSelectedStudio(studiosData[0].uuid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !selectedStudio) return;

    setCreating(true);
    try {
      await createTrainer({
        first_name: firstName,
        last_name: lastName,
        bio,
        studio: selectedStudio,
        photo: null // simplified for now
      });
      setIsDialogOpen(false);
      setFirstName("");
      setLastName("");
      setBio("");
      loadData(); // Refresh list
    } catch (err) {
      alert("Failed to add instructor.");
    } finally {
      setCreating(false);
    }
  };

  const filteredTrainers = trainers.filter(t => 
    t.first_name.toLowerCase().includes(search.toLowerCase()) || 
    t.last_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Instructors</h1>
            <p className="text-slate-500 mt-2">Manage your teaching staff across all studios.</p>
          </div>
          
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search instructors..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
                />
             </div>

             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                    <Plus size={18} />
                    Add Instructor
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Instructor</DialogTitle>
                    <DialogDescription>Enter the details of the new team member.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                        <input 
                          required
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                         <input 
                          required
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Studio</label>
                      <select 
                        value={selectedStudio}
                        onChange={e => setSelectedStudio(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                      >
                         {studios.map(s => (
                           <option key={s.uuid} value={s.uuid}>{s.name} - {s.city}</option>
                         ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bio (Optional)</label>
                      <textarea 
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={() => setIsDialogOpen(false)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={creating}
                        className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {creating ? "Saving..." : "Save Instructor"}
                      </button>
                    </div>
                  </form>
                </DialogContent>
             </Dialog>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading instructors...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrainers.map(trainer => (
              <div key={trainer.uuid} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                 <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                    {trainer.photo ? (
                      <img src={trainer.photo} alt={trainer.first_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={32} />
                    )}
                 </div>
                 <h3 className="text-lg font-bold text-slate-900">{trainer.first_name} {trainer.last_name}</h3>
                 <div className="text-sm text-purple-600 font-medium mt-1 mb-3">Senior Instructor</div>
                 <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                   {trainer.bio || "No biography available for this instructor."}
                 </p>
                 <div className="mt-auto w-full pt-4 border-t border-slate-50 flex gap-2">
                    <button className="flex-1 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg">View Profile</button>
                    <button className="flex-1 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-lg">Schedule</button>
                 </div>
              </div>
            ))}
            {filteredTrainers.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                No instructors found.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
