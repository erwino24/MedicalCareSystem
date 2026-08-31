import React, { useState } from 'react';
import type { Patient } from '../types/patient';
import { calculateObGynMetrics } from '../utils/obgynCalculator';
import { Search, UserPlus, Calendar, ChevronRight, Baby, Filter } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
  onAddPatientClick: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onAddPatientClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrimester, setFilterTrimester] = useState<string>('ALL');

  // Filter patients by search term
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contactNumber.includes(searchTerm) ||
      patient.address.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTrimester === 'ALL') return true;
    const metrics = calculateObGynMetrics(patient.lmp);
    return metrics.trimester === filterTrimester;
  });

  // Alphabetical sort by full name
  const sortedPatients = [...filteredPatients].sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  );

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* Sticky Header Section */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-800">Patients Directory</h2>
            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-semibold">
              {sortedPatients.length}
            </span>
          </div>
          <button
            onClick={onAddPatientClick}
            className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Patient</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, phone, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs no-scrollbar">
          <Filter className="w-3 h-3 text-slate-400 shrink-0 mr-1" />
          {['ALL', '1st', '2nd', '3rd'].map((tri) => (
            <button
              key={tri}
              onClick={() => setFilterTrimester(tri)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition ${
                filterTrimester === tri
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tri === 'ALL' ? 'All Trimesters' : `${tri} Trimester`}
            </button>
          ))}
        </div>
      </div>

      {/* Patient List Items Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {sortedPatients.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Baby className="w-10 h-10 mx-auto stroke-1 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No patients found</p>
            <p className="text-xs text-slate-400">Try adjusting your search filter or add a new patient.</p>
          </div>
        ) : (
          sortedPatients.map((patient) => {
            const isSelected = patient.id === selectedPatientId;
            const metrics = calculateObGynMetrics(patient.lmp);
            const lastCheckup = patient.checkups[0];

            return (
              <button
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className={`w-full text-left p-3.5 transition flex items-start justify-between group hover:bg-teal-50/40 min-h-[64px] ${
                  isSelected
                    ? 'bg-teal-50/80 border-l-4 border-teal-600 shadow-2xs'
                    : 'bg-white'
                }`}
              >
                <div className="space-y-1 pr-2 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-sm font-semibold truncate ${
                      isSelected ? 'text-teal-900' : 'text-slate-800 group-hover:text-teal-700'
                    }`}>
                      {patient.fullName}
                    </h3>
                    <span className="text-[11px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      G{patient.gravida}P{patient.para}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span>{patient.age} yrs</span>
                    <span>•</span>
                    <span className="truncate">{patient.contactNumber}</span>
                  </div>

                  {lastCheckup && (
                    <div className="flex items-center space-x-1 text-[11px] text-slate-400 pt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Last visit: {lastCheckup.date}</span>
                    </div>
                  )}
                </div>

                {/* Right Badge (AOG) */}
                <div className="flex flex-col items-end shrink-0 space-y-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-2xs ${
                    metrics.trimester === '3rd'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : metrics.trimester === '2nd'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    AOG: {metrics.aogFormatted}
                  </span>
                  <div className="flex items-center text-[10px] text-slate-400 group-hover:text-teal-600 transition">
                    <span>Details</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
