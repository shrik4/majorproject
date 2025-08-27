import React from 'react';

const OtherInformationPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Other Information</h1>
      <p className="text-lg">This page will display additional features and information.</p>
      {/* Add your extra features here */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Feature 1</h2>
          <p>Description of Feature 1.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Feature 2</h2>
          <p>Description of Feature 2.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Feature 3</h2>
          <p>Description of Feature 3.</p>
        </div>
      </div>
    </div>
  );
};

export default OtherInformationPage;