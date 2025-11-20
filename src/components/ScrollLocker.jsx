// ScrollLocker.jsx 

import React, { useEffect } from 'react';

const ScrollLocker = ({ children }) => {
    useEffect(() => {
        // 1. Add the class when the component loads (Page mounts)
        document.body.classList.add('no-scroll-page');

        return () => {
            // 2. Remove the class when the component unloads (Page unmounts)
            document.body.classList.remove('no-scroll-page');
        };
    }, []);

    return <>{children}</>;
};

export default ScrollLocker;