import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import EditItemModal from './components/EditItemModal';
import SectionCard from './components/SectionCard';
import TaskItem from './components/TaskItem';
import HabitItem from './components/HabitItem';
import NavButton from './components/NavButton';
import CalendarDay from './components/CalendarDay';
import { THEME_COLORS } from './theme';
import { loadData, saveData, checkDailyReset } from './utils/storage';
import iconToday from './assets/today.png';
import iconHabits from './assets/habits.png';
import iconCalendar from './assets/calendar.png';
import iconGym from './assets/gym.png';

function App() {
  // --- СОСТОЯНИЕ (STATE) ---
  const [activeTab, setActiveTab] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(true);
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);
  const [isHabitsOpen, setIsHabitsOpen] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null); // 'task' | 'habit'
  const [selectedDateKey, setSelectedDateKey] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [calendarSlideDir, setCalendarSlideDir] = useState(0); // -1 left, 1 right
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week'

  // --- ЭФФЕКТЫ (EFFECTS) ---
  useEffect(() => {
    const savedTasks = loadData('dailyTasks');
    const savedHabits = loadData('habits');

    const { habits: validatedHabits, lastResetDate } = checkDailyReset(savedHabits);

    setTasks(Array.isArray(savedTasks) ? savedTasks : []);
    setHabits(validatedHabits);

    localStorage.setItem('lastHabitsResetDate', lastResetDate);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveData('dailyTasks', tasks);
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveData('habits', habits);
  }, [habits, hydrated]);

  const handleAddEntry = (e) => {
    e.preventDefault();
    const title = e.target.elements.title.value;
    
    if (activeTab === 'today' || activeTab === 'calendar') {
      const baseDate =
        activeTab === 'today' ? new Date() : new Date(selectedDateKey);
      const newTask = {
        id: Date.now(),
        title,
        completed: false,
        createdAt: baseDate.toISOString(),
        completedAt: null,
      };
      setTasks([...tasks, newTask]);
    } else if (activeTab === 'habits') {
      const newHabit = {
        id: Date.now(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        countDay: 0,
        completedAt: null,
      };
      setHabits([...habits, newHabit]);
    }
    
    e.target.reset();
    setIsModalOpen(false);
  };

  const toggleTaskStatus = (id) => {
    const todayKey = new Date().toISOString().split('T')[0];
    setTasks(tasks.map(task => {
      if (task.id !== id) return task;
      const nextCompleted = !task.completed;
      return {
        ...task,
        completed: nextCompleted,
        completedAt: nextCompleted ? todayKey : null,
      };
    }));
  };

  const toggleHabitStatus = (id) => {
    const todayKey = new Date().toISOString().split('T')[0];
    setHabits(habits.map(habit => {
      if (habit.id !== id) return habit;
      const nextCompleted = !habit.completed;
      return {
        ...habit,
        completed: nextCompleted,
        completedAt: nextCompleted ? todayKey : null,
      };
    }));
  };

  const openEditTask = (task) => {
    setEditingItem(task);
    setEditingType('task');
  };

  const openEditHabit = (habit) => {
    setEditingItem(habit);
    setEditingType('habit');
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setEditingType(null);
  };

  const handleSaveItem = (id, newTitle, type) => {
    if (type === 'task') {
      setTasks(prev =>
        prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t)),
      );
    } else if (type === 'habit') {
      setHabits(prev =>
        prev.map((h) => (h.id === id ? { ...h, title: newTitle } : h)),
      );
    }
    closeEditModal();
  };

  const handleDeleteItem = (id, type) => {
    if (type === 'task') {
      setTasks(prev => prev.filter((t) => t.id !== id));
    } else if (type === 'habit') {
      setHabits(prev => prev.filter((h) => h.id !== id));
    }
    closeEditModal();
  };

  // Важно: Date('YYYY-MM-DD') парсится как UTC и может сдвигать день в локальной TZ.
  // Поэтому для календаря используем локальные (year, month, day).
  const parseDateKeyLocal = (dateKey) => {
    if (!dateKey || typeof dateKey !== 'string') return null;
    const parts = dateKey.split('-').map((p) => Number(p));
    if (parts.length !== 3) return null;
    const [y, m, d] = parts;
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const getDateKey = (value) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Разделяем задачи на активные и выполненные
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const selectedDate = parseDateKeyLocal(selectedDateKey) || new Date();
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth(); // 0-11

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastOfMonth.getDate();

  // Начинаем неделю с понедельника
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday

  const calendarCells = [];
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  // Дни предыдущего месяца
  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const day = prevMonthLastDate - i;
    calendarCells.push({
      date: new Date(year, month - 1, day),
      isOtherMonth: true,
    });
  }

  // Текущий месяц
  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarCells.push({
      date: new Date(year, month, day),
      isOtherMonth: false,
    });
  }

  // Дни следующего месяца до заполнения сетки (6 недель максимум)
  const nextMonthStart = new Date(year, month + 1, 1);
  let nextDay = 1;
  while (calendarCells.length % 7 !== 0 || calendarCells.length < 42) {
    calendarCells.push({
      date: new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth(), nextDay),
      isOtherMonth: true,
    });
    nextDay += 1;
  }

  const todayKey = getDateKey(new Date());

  // Неделя (Пн..Вс), в которой находится выбранный день
  const selectedWeekStart = (() => {
    const d = parseDateKeyLocal(selectedDateKey) || new Date();
    const weekday = (d.getDay() + 6) % 7; // Пн=0
    d.setDate(d.getDate() - weekday);
    return d;
  })();
  const weekCells = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(
      selectedWeekStart.getFullYear(),
      selectedWeekStart.getMonth(),
      selectedWeekStart.getDate() + i,
    );
    return { date, isOtherMonth: date.getMonth() !== month };
  });

  const hasPendingForDay = (dateKey) => {
    if (!dateKey) return false;
    const hasTask = tasks.some(
      (t) => !t.completed && getDateKey(t.createdAt) === dateKey,
    );
    const hasHabit = habits.some(
      (h) => !h.completed && getDateKey(h.createdAt) === dateKey,
    );
    return hasTask || hasHabit;
  };

  // Задачи дня — по дате создания
  const tasksForSelectedDay = tasks.filter(
    (t) => getDateKey(t.createdAt) === selectedDateKey,
  );

  // Привычки, выполненные в выбранный день — по дате выполнения
  const habitsForSelectedDay = habits.filter(
    (h) => h.completedAt && getDateKey(h.completedAt) === selectedDateKey,
  );

  const changeMonth = (offset) => {
    const d = parseDateKeyLocal(selectedDateKey) || new Date();
    d.setMonth(d.getMonth() + offset);
    setSelectedDateKey(getDateKey(d));
    setCalendarSlideDir(offset > 0 ? 1 : -1);
    setTimeout(() => setCalendarSlideDir(0), 260);
  };

  // --- РЕНДЕРИНГ (UI) ---
  return (
    <div className={`h-screen flex flex-col ${THEME_COLORS.background}`}>
      {/* КОНТЕНТ (СКРОЛЛИТСЯ) */}
      <main className="flex-1 overflow-y-auto">
        {/* Вкладка: СЕГОДНЯ */}
        {activeTab === 'today' && (
          <div>
            {/* Header ПРИКЛЕЕН К ВЕРХУ внутри скролла */}
            <header className="sticky top-0 bg-black text-white p-5 shadow-lg z-10">
              <h1 className="text-2xl font-bold tracking-tight">Сегодня</h1>
              <p className={`text-sm mt-1 ${THEME_COLORS.dateTextPrimary}`}>
                {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </p>
            </header>
            
            <div className="p-4 space-y-4 bg-black min-h-screen text-white">
              {/* Секция задач */}
              <SectionCard
                title="Задачи"
                count={activeTasks.length}
                isOpen={isTasksOpen}
                onToggle={() => setIsTasksOpen(prev => !prev)}
                items={activeTasks}
                renderItem={(task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTaskStatus}
                    onOpenDetails={openEditTask}
                  />
                )}
              />

              {/* Секция выполненных задач */}
              <SectionCard
                title="Выполнено"
                count={completedTasks.length}
                isOpen={isCompletedOpen}
                onToggle={() => setIsCompletedOpen(prev => !prev)}
                items={completedTasks}
                renderItem={(task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTaskStatus}
                    onOpenDetails={openEditTask}
                  />
                )}
              />

              {/* Секция привычек */}
              <SectionCard
                title="Привычки"
                count={habits.length}
                isOpen={isHabitsOpen}
                onToggle={() => setIsHabitsOpen(prev => !prev)}
                items={habits}
                emptyText="Список привычек пуст."
                renderItem={(habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    onToggle={toggleHabitStatus}
                    onOpenDetails={openEditHabit}
                  />
                )}
              />
            </div>
          </div>
        )}

        {/* Вкладка: ПРИВЫЧКИ */}
        {activeTab === 'habits' && (
          <div>
            {/* Header ПРИКЛЕЕН К ВЕРХУ внутри скролла */}
            <header className="sticky top-0 bg-black text-white p-5 shadow-lg z-10">
              <h1 className="text-2xl font-bold tracking-tight">Привычки</h1>
              <p className={`text-sm mt-1 ${THEME_COLORS.dateTextPrimary}`}>
                {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </p>
            </header>
            
            <div className="p-4 space-y-4 bg-black min-h-screen text-white">
              {/* Секция привычек */}
              <SectionCard
                title="Привычки"
                count={habits.length}
                isOpen={isHabitsOpen}
                onToggle={() => setIsHabitsOpen(prev => !prev)}
                items={habits}
                emptyText="Список привычек пуст."
                renderItem={(habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    onToggle={toggleHabitStatus}
                    onOpenDetails={openEditHabit}
                  />
                )}
              />
            </div>
          </div>
        )}

        {/* Вкладка: КАЛЕНДАРЬ */}
        {activeTab === 'calendar' && (
          <div className="min-h-screen bg-black text-white">
            <header className="sticky top-0 bg-black p-5 shadow-lg z-20">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {selectedDate.toLocaleDateString('ru-RU', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h1>
                <p className={`text-sm mt-1 ${THEME_COLORS.dateTextPrimary}`}>
                  {selectedDate.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Дни недели всегда сверху */}
              <div className="mt-4 grid grid-cols-7 text-center text-xs text-zinc-500">
                <span>Пн</span>
                <span>Вт</span>
                <span>Ср</span>
                <span>Чт</span>
                <span>Пт</span>
                <span>Сб</span>
                <span>Вс</span>
              </div>
            </header>

            <div className="p-4 space-y-6">
              {/* Календарь всегда в поле зрения */}
              <div
                className={`space-y-4 sticky top-[96px] bg-black pb-4 z-10 ${
                  calendarSlideDir === 1
                    ? 'calendar-slide-left'
                    : calendarSlideDir === -1
                      ? 'calendar-slide-right'
                      : ''
                }`}
              >
                {/* Календарная сетка */}
                <div className="rounded-2xl bg-zinc-900 p-4">
                  <div className="overflow-hidden">
                    <div
                      className={`grid grid-cols-7 gap-y-2 transition-all duration-300 ${
                        calendarView === 'month'
                          ? 'max-h-[520px] opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      {calendarCells.map((cell) => {
                        const { date, isOtherMonth } = cell;
                        const key = getDateKey(date);
                        return (
                          <CalendarDay
                            key={key}
                            date={date}
                            isToday={key === todayKey}
                            isSelected={key === selectedDateKey}
                            isOtherMonth={isOtherMonth}
                            hasPending={hasPendingForDay(key)}
                            onSelect={(d) => setSelectedDateKey(getDateKey(d))}
                          />
                        );
                      })}
                    </div>

                    <div
                      className={`grid grid-cols-7 gap-y-2 transition-all duration-300 ${
                        calendarView === 'week'
                          ? 'max-h-[80px] opacity-100 mt-0'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      {weekCells.map((cell) => {
                        const { date, isOtherMonth } = cell;
                        const key = getDateKey(date);
                        return (
                          <CalendarDay
                            key={key}
                            date={date}
                            isToday={key === todayKey}
                            isSelected={key === selectedDateKey}
                            isOtherMonth={isOtherMonth}
                            hasPending={hasPendingForDay(key)}
                            onSelect={(d) => setSelectedDateKey(getDateKey(d))}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Кнопки управления календарём */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDateKey(todayKey);
                        setCalendarView('month');
                      }}
                      className={`px-3 py-2 text-sm rounded-full border ${THEME_COLORS.accentBg} text-white border-transparent active:scale-[0.98] transition`}
                    >
                      Сегодня
                    </button>
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      className="px-3 py-2 text-sm rounded-full bg-zinc-900 text-zinc-200 hover:bg-zinc-800 active:scale-[0.98] transition"
                    >
                      Предыдущий месяц
                    </button>
                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      className="px-3 py-2 text-sm rounded-full bg-zinc-900 text-zinc-200 hover:bg-zinc-800 active:scale-[0.98] transition"
                    >
                      Следующий месяц
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCalendarView('month')}
                      className={`px-3 py-2 text-sm rounded-full border ${
                        calendarView === 'month'
                          ? `${THEME_COLORS.accentBg} text-white border-transparent`
                          : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800'
                      } transition`}
                    >
                      Развернуть календарь
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarView('week')}
                      className={`px-3 py-2 text-sm rounded-full border ${
                        calendarView === 'week'
                          ? `${THEME_COLORS.accentBg} text-white border-transparent`
                          : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800'
                      } transition`}
                    >
                      Сжать до недели
                    </button>
                  </div>
                </div>
              </div>

              {/* Списки задач и привычек на выбранный день */}
              <SectionCard
                title="Задачи дня"
                count={tasksForSelectedDay.length}
                isOpen
                onToggle={() => {}}
                items={tasksForSelectedDay}
                renderItem={(task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTaskStatus}
                    onOpenDetails={openEditTask}
                  />
                )}
              />

              <SectionCard
                title="Привычки дня"
                count={habitsForSelectedDay.length}
                isOpen
                onToggle={() => {}}
                items={habitsForSelectedDay}
                renderItem={(habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    onToggle={toggleHabitStatus}
                    onOpenDetails={openEditHabit}
                  />
                )}
              />
            </div>
          </div>
        )}

        {/* Вкладка: ТРЕНИРОВКИ */}
        {activeTab === 'workouts' && (
          <div className="min-h-screen bg-black text-white">
            <header className="sticky top-0 bg-black text-white p-5 shadow-lg z-10">
              <h1 className="text-2xl font-bold tracking-tight">Тренировки</h1>
              <p className={`text-sm mt-1 ${THEME_COLORS.dateTextPrimary}`}>
                {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </p>
            </header>
            <div className="p-4">
              <div className={`${THEME_COLORS.sectionBackground} rounded-2xl p-6 text-center`}>
                <p className="text-zinc-400">Здесь будут ваши тренировки.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Плавающая кнопка создания задачи/привычки (FAB) */}
      {(activeTab === 'today' || activeTab === 'calendar' || activeTab === 'habits') && (
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
          }}
          className={`fixed right-5 bottom-20 h-14 w-14 rounded-full text-white text-3xl flex items-center justify-center shadow-xl transition z-40 border-0 outline-none ring-0 ${THEME_COLORS.accentBg} ${THEME_COLORS.accentBgHover}`}
        >
          +
        </button>
      )}

      {/* НИЖНЯЯ НАВИГАЦИЯ */}
      <footer className="bg-black py-2 px-4">
        <nav className="flex justify-around">
          <NavButton
            icon={iconToday}
            label="Сегодня"
            isActive={activeTab === 'today'}
            onClick={() => setActiveTab('today')}
          />
          <NavButton
            icon={iconHabits}
            label="Привычки"
            isActive={activeTab === 'habits'}
            onClick={() => setActiveTab('habits')}
          />
          <NavButton
            icon={iconCalendar}
            label="Календарь"
            isActive={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
          />
          <NavButton
            icon={iconGym}
            label="Тренировки"
            isActive={activeTab === 'workouts'}
            onClick={() => setActiveTab('workouts')}
          />
        </nav>
      </footer>

      {/* Модальное окно с формой */}
      <Modal 
        isOpen={isModalOpen} 
        title={activeTab === 'today' ? 'Новая запись на сегодня' : 'Создание привычки'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleAddEntry}>
          <input 
            name="title" 
            type="text" 
            placeholder={activeTab === 'today' ? 'Что планируем сделать?' : 'Название привычки'} 
            required 
            autoFocus
            className="w-full p-3 rounded-lg focus:outline-none  mb-2 "
          />
        </form>
      </Modal>

      <EditItemModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        type={editingType}
        onClose={closeEditModal}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}

export default App;