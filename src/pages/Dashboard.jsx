import { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    return (
        <div className='dashboard-container'>
            <div className='dashboard-content'>
                <h1>Welcome! This is your user dashboard</h1>
                <p>This will have your a link to your active boards</p>
                <p>as well as a link to create a new board</p>
            </div>
        </div>
    );
}

export default Dashboard;