// Вспомогательная функция для получения текущей даты строкой (ГГГГ-ММ-ДД)
const getTodayDate = () => new Date().toISOString().split('T')[0];
const HABITS_RESET_DATE_KEY = 'lastHabitsResetDate';
const LEGACY_RESET_DATE_KEY = 'lastResetDate';

export const loadData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const normalizeHabit = (habit) => {
  const createdAt = habit?.createdAt || new Date().toISOString();
  const countDay = Number.isFinite(Number(habit?.countDay)) ? Number(habit.countDay) : 0;

  return {
    id: habit?.id ?? Date.now(),
    title: habit?.title ?? '',
    completed: Boolean(habit?.completed),
    createdAt,
    countDay,
  };
};

// Ежедневный сброс относится ТОЛЬКО к привычкам.
// Перед сбросом флага completed увеличиваем countDay на 1, если привычка была выполнена.
// Функция БЕЗ побочных эффектов: она ничего не пишет в localStorage.
export const checkDailyReset = (habits) => {
  const safeHabits = Array.isArray(habits) ? habits : [];
  const lastResetFromStorage =
    localStorage.getItem(HABITS_RESET_DATE_KEY) || localStorage.getItem(LEGACY_RESET_DATE_KEY);
  const today = getTodayDate();

  if (lastResetFromStorage !== today) {
    const resetHabits = safeHabits.map((h) => {
      const habit = normalizeHabit(h);
      const countDay = habit.completed ? habit.countDay + 1 : habit.countDay;
      return { ...habit, completed: false, countDay };
    });
    return {
      habits: resetHabits,
      lastResetDate: today,
    };
  }

  const normalizedHabits = safeHabits.map(normalizeHabit);
  return {
    habits: normalizedHabits,
    lastResetDate: lastResetFromStorage || today,
  };
};