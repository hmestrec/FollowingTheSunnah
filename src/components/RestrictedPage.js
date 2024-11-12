import React from 'react';

function RestrictedPage() {
  return (
    <div className="restricted-page">
      <h2>Access Denied</h2>
      <p>This page is only restricted for admin use only.</p>
    </div>
  );
}

export default RestrictedPage;
