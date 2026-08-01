'use client';

import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileJson, Printer, CheckCircle2 } from 'lucide-react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { calculatePersonalRecords, calculateWeeklyReview } from '../../../lib/analyticsUtils';
import { toast } from 'sonner';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  logs: HabitLog;
}

export default function DataExportModal({ isOpen, onClose, habits, logs }: DataExportModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export CSV
  const handleExportCSV = () => {
    setDownloading('csv');
    try {
      let csvContent = 'Habit ID,Habit Name,Category,Goal,Date,Completed\n';

      // Gather dates logged
      const logEntries = Object.entries(logs);
      if (logEntries.length === 0) {
        habits.forEach(h => {
          csvContent += `"${h.id}","${h.name}","${h.category || 'General'}",${h.goal},"N/A","false"\n`;
        });
      } else {
        logEntries.forEach(([key, done]) => {
          const parts = key.split('_');
          const habitId = parts[0];
          const habit = habits.find(h => h.id === habitId);
          if (parts.length >= 4 && habit) {
            const dateStr = `${parts[1]}-${parts[2].padStart(2, '0')}-${parts[3].padStart(2, '0')}`;
            csvContent += `"${habitId}","${habit.name}","${habit.category || 'General'}",${habit.goal},"${dateStr}","${done}"\n`;
          }
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `HabitBloom_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV export generated successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export CSV');
    } finally {
      setDownloading(null);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    setDownloading('json');
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        version: '2.0',
        habits,
        logs,
      };

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `HabitBloom_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('JSON backup downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export JSON');
    } finally {
      setDownloading(null);
    }
  };

  // Printable PDF Summary
  const handlePrintSummary = () => {
    setDownloading('pdf');
    try {
      const records = calculatePersonalRecords(habits, logs);
      const review = calculateWeeklyReview(habits, logs);

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to open the print summary');
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>HabitBloom Executive Summary - ${new Date().toLocaleDateString()}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
              h1 { color: #059669; font-size: 28px; margin-bottom: 4px; }
              .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
              .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
              .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
              .card-title { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
              .card-val { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; }
              th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 14px; }
              th { background: #f1f5f9; font-weight: 600; }
              .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #ecfdf5; color: #047857; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h1>🌱 HabitBloom Progress Report</h1>
            <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</div>

            <h2>Personal Records & Performance Overview</h2>
            <div class="grid">
              <div class="card"><div class="card-title">Consistency Score</div><div class="card-val">${records.consistencyScore}%</div></div>
              <div class="card"><div class="card-title">Longest Streak</div><div class="card-val">${records.longestStreak} days</div></div>
              <div class="card"><div class="card-title">Total Active Days</div><div class="card-val">${records.totalActiveDays} days</div></div>
              <div class="card"><div class="card-title">Habits Completed</div><div class="card-val">${records.totalHabitsCompleted}</div></div>
            </div>

            <h2>Weekly Performance Summary</h2>
            <div class="grid">
              <div class="card"><div class="card-title">Weekly Completion Rate</div><div class="card-val">${review.completionRate}%</div></div>
              <div class="card"><div class="card-title">Most Productive Day</div><div class="card-val">${review.mostProductiveDay}</div></div>
              <div class="card"><div class="card-title">Best Habit</div><div class="card-val">${review.bestHabit ? review.bestHabit.emoji + ' ' + review.bestHabit.name : 'N/A'}</div></div>
              <div class="card"><div class="card-title">Weakest Habit</div><div class="card-val">${review.weakestHabit ? review.weakestHabit.emoji + ' ' + review.weakestHabit.name : 'N/A'}</div></div>
            </div>

            <h2>Active Habits</h2>
            <table>
              <thead>
                <tr>
                  <th>Habit</th>
                  <th>Category</th>
                  <th>Monthly Goal</th>
                </tr>
              </thead>
              <tbody>
                ${habits.map(h => `
                  <tr>
                    <td>${h.emoji} <strong>${h.name}</strong></td>
                    <td><span class="badge">${h.category || 'General'}</span></td>
                    <td>${h.goal} days / month</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      toast.success('Print summary window opened');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate print summary');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Download size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Export Your Habit Data</h3>
            <p className="text-xs text-slate-500">Download reports or backups anytime</p>
          </div>
        </div>

        <div className="space-y-3 my-6">
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            disabled={downloading !== null}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Export CSV Spreadsheet</div>
                <div className="text-[11px] text-slate-500">Compatible with Excel, Google Sheets</div>
              </div>
            </div>
            <CheckCircle2 size={16} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </button>

          {/* JSON Export */}
          <button
            onClick={handleExportJSON}
            disabled={downloading !== null}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-500/50 hover:bg-blue-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <FileJson size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Export Raw JSON Data</div>
                <div className="text-[11px] text-slate-500">Full backup file for data migration</div>
              </div>
            </div>
            <CheckCircle2 size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Printable PDF Summary */}
          <button
            onClick={handlePrintSummary}
            disabled={downloading !== null}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-purple-500/50 hover:bg-purple-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <Printer size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700">Printable PDF Report</div>
                <div className="text-[11px] text-slate-500">Clean single-page executive summary</div>
              </div>
            </div>
            <CheckCircle2 size={16} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
          </button>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
          >
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}
