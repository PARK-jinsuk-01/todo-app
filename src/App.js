import React, { useState } from 'react';
import './App.css';
import Day from './Day';
import Week from './Week';
import Month from './Month';


function App() {
  const [DayButton, setDayButton] = useState(false);
  const [WeekButton, setWeekButton] = useState(false);
  const [MonthButton, setMonthButton] = useState(false);

  const dButton = () => {
    setDayButton(true)
    setWeekButton(false)
    setMonthButton(false)
  }
  const wButton = () => {
    setWeekButton(true)
    setDayButton(false)
    setMonthButton(false)
  }
  const mButton = () => {
    setMonthButton(true)
    setDayButton(false)
    setWeekButton(false)
  }

  return (
    <div>
      <h1>To Do List</h1>
      <div>
      <button onClick={dButton} >Day</button>
      <button onClick={wButton} >Week</button>
      <button onClick={mButton} >Month</button>
      </div>
      
      {DayButton == true ? <Day /> : ''}
      {WeekButton == true ? <Week /> : ''}
      {MonthButton == true ? <Month /> : ''}
      
    </div>
  );
}

export default App;
