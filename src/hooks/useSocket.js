/**
 * hooks/useSocket.js – Socket.IO client hook
 *
 * Creates a single socket connection and handles joining rooms
 * for real-time queue updates and personal notifications.
 */
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

/**
 * @param {object} options
 * @param {number|null} options.slotId   – join the slot room for queue updates
 * @param {number|null} options.userId   – join the user room for notifications
 * @param {function}    options.onQueueUpdate – callback(data) for queue_updated events
 * @param {function}    options.onNotification – callback(data) for notification events
 * @returns {object} socket instance ref
 */
export default function useSocket({ slotId, userId, onQueueUpdate, onNotification } = {}) {
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            if (slotId) socket.emit('join_slot', slotId);
            if (userId) socket.emit('join_user', userId);
        });

        if (onQueueUpdate) {
            socket.on('queue_updated', onQueueUpdate);
        }
        if (onNotification) {
            socket.on('notification', onNotification);
        }

        return () => {
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slotId, userId]);

    return socketRef;
}
