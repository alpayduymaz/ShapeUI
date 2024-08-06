import React from 'react';
import axios from 'axios';

const ShapePanel = ({ fetchShapes }) => {
  const handleCreateShape = async (shapeType) => {
    try {
      const url = `http://localhost:5180/Shape/createShape`;
      console.log(url);
      await axios.post(url, null, { params: { type: shapeType } });
      fetchShapes();
    } catch (error) {
      console.error('Error creating shape:', error);
    }
  };

  const handleRemoveShape = async () => {
    try {
      const url = `http://localhost:5180/Shape/removeShape`;
      await axios.delete(url);
      fetchShapes();
    } catch (error) {
      console.error('Error removing shape:', error);
    }
  };

  return (
    <div>
      <h2>Shape Panel</h2>
      <button onClick={() => handleCreateShape('square')}>Create Square</button>
      <button onClick={() => handleCreateShape('circle')}>Create Circle</button>
      <button onClick={() => handleCreateShape('rectangle')}>Create Rectangle</button>
      <button onClick={handleRemoveShape}>Remove Last Shape</button>
    </div>
  );
};

export default ShapePanel;
