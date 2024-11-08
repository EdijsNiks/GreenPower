export const mockData = {
    profile: {
      userId: 1,
      username: "john_doe",
      email: "john@example.com",
      checkInStatus: "Checked In",
    },
    warehouse: [
      {
        id: "1",
        name: "Item 1",
        description: "This is a sample description for Item 1.",
        photos: [
          { uri: "https://play-lh.googleusercontent.com/mLvvgUXJVZeu-GbqWZfr8ug74V7d8Od9yU2AOvUUptiki9wIH-BJHataFTJI_J0TlQ" },
          { uri: "https://example.com/photo2.jpg" },
          { uri: "https://example.com/photo2.jpg" },
          { uri: "https://example.com/photo2.jpg" },
          { uri: "https://example.com/photo2.jpg" },
          { uri: "https://example.com/photo2.jpg" },
          { uri: "https://example.com/photo2.jpg" },
        ],
        dateCreated: "2024-11-01 10:30 AM",
        count: 10,
        reserved: false,
        category: "Category A",
      },
      {
        id: "2",
        name: "Item 2",
        description: "This is a sample description for Item 2.",
        photos: [
          { uri: "https://example.com/photo3.jpg" },
        ],
        dateCreated: "2024-11-02 02:45 PM",
        count: 5,
        reserved: true,
        category: "Category B",
      },
      // Add more items as needed
    ],
    projects: [
      { id: 1, title: "Project 1", status: "In Progress" },
      { id: 2, title: "Project 2", status: "Completed" },
    ],
    checkIn: [
      { id: 1, location: "Main Entrance", time: "09:00 AM" },
      { id: 2, location: "Warehouse A", time: "09:15 AM" },
    ],
  };
  