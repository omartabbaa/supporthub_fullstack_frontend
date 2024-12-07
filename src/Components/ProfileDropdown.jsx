import { Link } from 'react-router-dom';
import { useRef } from 'react';

const ProfileDropdown = ({ isOpen, onToggle, onClose, isLogin, onLogout }) => {
    const dropdownRef = useRef(null);

    return (
        <div className='dropdown-container' ref={dropdownRef}>
            <div onClick={onToggle} className='profile'></div>
            {isOpen && (
                <div className='profile-dropdown'>
                    <h3>Profile</h3>
                    <ul>
                        <Link to="/signup"><li>Signup</li></Link>
                        {isLogin ? (
                            <button onClick={onLogout}>Logout</button>
                        ) : (
                            <Link to="/login"><li>Login</li></Link>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;