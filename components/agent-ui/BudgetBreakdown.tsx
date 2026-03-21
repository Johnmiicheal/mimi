"use client";

import { CurrencyDollar, Warning, CheckCircle, TrendUp, TrendDown } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BudgetCategory {
  name: string;
  budgeted: number;
  actual: number;
  color: string;
}

interface BudgetBreakdownProps {
  totalBudget: number;
  categories: BudgetCategory[];
  travelers: number;
  currency?: string;
  suggestions?: string[];
}

export function BudgetBreakdown({
  totalBudget,
  categories,
  travelers,
  currency = "USD",
  suggestions = []
}: BudgetBreakdownProps) {
  const totalActual = categories.reduce((sum, cat) => sum + cat.actual, 0);
  const totalActualPerPerson = totalActual / travelers;
  const budgetPerPerson = totalBudget;
  const totalActualAll = totalActual * travelers;
  const totalBudgetAll = totalBudget * travelers;

  const isOverBudget = totalActualPerPerson > budgetPerPerson;
  const difference = totalActualPerPerson - budgetPerPerson;
  const differencePercent = (difference / budgetPerPerson) * 100;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className={cn(
        "px-6 py-4 bg-gradient-to-r",
        isOverBudget
          ? "from-red-500 to-red-600"
          : "from-green-500 to-green-600",
        "text-white"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CurrencyDollar weight="bold" className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Budget Summary</h3>
          </div>
          {isOverBudget ? (
            <Warning weight="fill" className="w-6 h-6" />
          ) : (
            <CheckCircle weight="fill" className="w-6 h-6" />
          )}
        </div>
      </div>

      {/* Total comparison */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Budget (per person)</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatMoney(budgetPerPerson)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatMoney(totalBudgetAll)} total for {travelers}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Est. Total (per person)</div>
            <div className={cn(
              "text-2xl font-bold",
              isOverBudget ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
            )}>
              {formatMoney(totalActualPerPerson)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatMoney(totalActualAll)} total for {travelers}
            </div>
          </div>
        </div>

        {/* Difference indicator */}
        <div className={cn(
          "mt-4 px-4 py-2 rounded-lg flex items-center gap-2",
          isOverBudget
            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
            : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
        )}>
          {isOverBudget ? (
            <TrendUp weight="bold" className="w-5 h-5" />
          ) : (
            <TrendDown weight="bold" className="w-5 h-5" />
          )}
          <span className="font-semibold">
            {isOverBudget ? "Over" : "Under"} budget by{" "}
            {formatMoney(Math.abs(difference))} ({Math.abs(differencePercent).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="px-6 py-4 space-y-3">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Breakdown by Category</h4>

        {categories.map((category, index) => {
          const percentage = (category.actual / totalActual) * 100;
          const isOver = category.actual > category.budgeted;

          return (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-sm font-medium",
                    isOver ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
                  )}>
                    {formatMoney(category.actual)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ backgroundColor: category.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage, 100)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                />
                {/* Budget marker */}
                {category.budgeted > 0 && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-gray-900 dark:bg-white opacity-40"
                    style={{
                      left: `${Math.min((category.budgeted / totalActual) * 100, 100)}%`
                    }}
                  />
                )}
              </div>

              {isOver && (
                <div className="text-xs text-red-600 dark:text-red-400">
                  {formatMoney(category.actual - category.budgeted)} over budget
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
            <span>💡</span>
            Cost-Saving Tips
          </h4>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
