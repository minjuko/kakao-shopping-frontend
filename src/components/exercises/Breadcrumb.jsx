import React from 'react';
import '../../styles/exercises/Breadcrumb.css';

const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
