import React from 'react';
import { X } from 'lucide-react';
import { ExpenseForm } from '../types';

interface ExpenseModalProps {
  showExpenseModal: boolean;
  setShowExpenseModal: (show: boolean) => void;
  expenseForm: ExpenseForm;
  setExpenseForm: (form: ExpenseForm) => void;
  handleExpenseSubmit: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ showExpenseModal, setShowExpenseModal, expenseForm, setExpenseForm, handleExpenseSubmit }) => {
  if (!showExpenseModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Session Expense</h3>
          <button
            onClick={() => setShowExpenseModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Session Date</label>
            <input
              type="date"
              value={expenseForm.sessionDate}
              onChange={(e) => setExpenseForm({ ...expenseForm, sessionDate: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Shuttles Used</label>
            <input
              type="number"
              value={expenseForm.shuttles}
              onChange={(e) => setExpenseForm({ ...expenseForm, shuttles: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="6"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Court Cost ($)</label>
            <input
              type="number"
              step="0.01"
              value={expenseForm.courtCost}
              onChange={(e) => setExpenseForm({ ...expenseForm, courtCost: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="120.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Costs ($)</label>
            <input
              type="number"
              step="0.01"
              value={expenseForm.additionalCosts}
              onChange={(e) => setExpenseForm({ ...expenseForm, additionalCosts: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExpenseSubmit}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Expense
            </button>
            <button
              onClick={() => setShowExpenseModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;

