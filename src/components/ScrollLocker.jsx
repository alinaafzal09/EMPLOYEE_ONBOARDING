// ScrollLocker.jsx 

import React, { useEffect } from 'react';

const ScrollLocker = ({ children }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return <>{children}</>;
};

export default ScrollLocker;
