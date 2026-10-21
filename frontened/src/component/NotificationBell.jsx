import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { baseUrl } from "../core";

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const socket = useSocket();

    
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await axios.get(`${baseUrl}/api/v1/notifications/all`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    token: token 
                }
            });
            setNotifications(res.data.data || []);
        } catch (err) {
            console.error("Fetch Notifications Error:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    
    useEffect(() => {
        if (!socket) return;

        socket.on("getNotification", (newNotif) => {
            setNotifications((prev) => [newNotif, ...prev]);
        });

        return () => socket.off("getNotification");
    }, [socket]);

   
    const handleOpen = async () => {
        setIsOpen(!isOpen);
        const unreadExists = notifications.some((n) => !n.isRead);

        if (!isOpen && unreadExists) {
            try {
                const token = localStorage.getItem("token");
                await axios.patch(`${baseUrl}/api/v1/notifications/mark-as-read`, {}, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        token: token 
                    }
                });
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, isRead: true }))
                );
            } catch (err) {
                console.error("Mark Read Error:", err);
            }
        }
    };

    
    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${baseUrl}/api/v1/notifications/${notificationId}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    token: token 
                }
            });

            setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        } catch (err) {
            console.error("Delete Notification Error:", err);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="relative">
          
            <button 
                onClick={handleOpen}
                className="relative p-2.5 rounded-full hover:bg-gray-100/70 transition-all text-gray-600 hover:text-[#851D52] outline-none cursor-pointer"
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
                <Bell size={20} strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#851D52] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-[80vh] sm:max-h-96 overflow-y-auto rounded-2xl bg-white border border-gray-100 shadow-2xl z-50 p-3 space-y-2">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 px-1">
                            <h3 className="text-gray-800 font-bold text-sm">Notifications</h3>
                            <span className="text-[11px] text-gray-400">{notifications.length} Total</span>
                        </div>

                        {notifications.length === 0 ? (
                            <p className="text-gray-400 text-xs text-center py-6">No notifications yet</p>
                        ) : (
                            notifications.map((notif) => {
                                const senderFirstName = notif.sender?.firstName || notif.sender?.firstname || "Someone";
                                const senderLastName = notif.sender?.lastName || notif.sender?.lastname || "";
                                const senderName = `${senderFirstName} ${senderLastName}`.trim();
                                const senderId = notif.sender?._id;
                                
                                const avatar = notif.sender?.profilePic || notif.sender?.profilePicture || notif.sender?.profilepicture || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10";

                                return (
                                    <div 
                                        key={notif._id} 
                                        className={`group p-2.5 rounded-xl transition-all flex items-center justify-between gap-3 ${
                                            notif.isRead 
                                                ? "bg-gray-50/50 text-gray-600" 
                                                : "bg-[#851D52]/5 text-gray-900 font-medium border border-[#851D52]/10"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Link 
                                                to={`/profile/${senderId}`} 
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                                            >
                                                <img 
                                                    src={avatar} 
                                                    alt="" 
                                                    className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                                                />
                                                <div className="text-xs flex-1 truncate">
                                                    <p className="leading-tight truncate">
                                                        <span className="font-bold text-[#851D52] hover:underline">
                                                            {senderName}
                                                        </span>{" "}
                                                        {notif.type === "like" && "liked your post."}
                                                        {notif.type === "comment" && "commented on your post."}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 mt-1 block">
                                                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>

                                        <button
                                            onClick={(e) => handleDelete(e, notif._id)}
                                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all outline-none cursor-pointer flex-shrink-0"
                                            title="Delete notification"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
};