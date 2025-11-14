import { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    return (
        <div className='dashboard-container'>
            <div className='dashboard-content'>
                <h1>Welcome user</h1>
            </div>
        </div>
    );
}

export default Dashboard;