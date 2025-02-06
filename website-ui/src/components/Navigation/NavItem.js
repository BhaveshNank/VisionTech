import React from 'react';

const NavItem = ({ label, link }) => {
    return (
        <li className="nav-item">
            <a href={link} className="nav-link">
                {label}
            </a>
        </li>
    );
};

export default NavItem;