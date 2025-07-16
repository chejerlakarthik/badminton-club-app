import React from 'react';
import { Plus } from 'lucide-react';
import { SessionExpense } from '../types';

interface ExpensesProps {
  sessionExpenses: SessionExpense[];
  setShowExpenseModal: (show: boolean) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ sessionExpenses, setShowExpenseModal }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Session Expenses</h2>
        <button
          onClick={() => setShowExpenseModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shuttles</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court Cost</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Head</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sessionExpenses.map(expense => (
            <tr key={expense.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {expense.sessionDate.toLocaleDateString('en-AU')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.shuttles}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${expense.courtCost}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.attendees}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${expense.perHeadCost.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Expenses;

