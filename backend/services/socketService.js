// =========================================================================
// Socket.io Service
// Centralises real-time event emission for admin and driver channels.
// =========================================================================

let io = null;

/**
 * Initialise the service with the Socket.io instance.
 * Called once from server.js after creating the HTTP server.
 */
function init(socketIOInstance) {
  io = socketIOInstance;

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Clients join a room based on their role + identifier
    // e.g. "admin" room or "driver:<vehicleId>" room
    socket.on('join', ({ role, vehicleId }) => {
      if (role === 'admin') {
        socket.join('admin');
        console.log(`   ↳ ${socket.id} joined admin room`);
      } else if (role === 'driver' && vehicleId) {
        socket.join(`driver:${vehicleId}`);
        console.log(`   ↳ ${socket.id} joined driver:${vehicleId} room`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
}

// -------------------------------------------------------------------
// Emit helpers — always send to admin; optionally also to the driver
// -------------------------------------------------------------------

function emitEnvironmentUpdate(data) {
  if (!io) return;
  io.to('admin').emit('environment:update', data);
  if (data.vehicleId) {
    io.to(`driver:${data.vehicleId}`).emit('environment:update', data);
  }
}

function emitADASAlert(data) {
  if (!io) return;
  io.to('admin').emit('adas:alert', data);
  if (data.vehicleId) {
    io.to(`driver:${data.vehicleId}`).emit('adas:alert', data);
  }
}

function emitRiskPrediction(data) {
  if (!io) return;
  io.to('admin').emit('risk:prediction', data);
  if (data.vehicleId) {
    io.to(`driver:${data.vehicleId}`).emit('risk:prediction', data);
  }
}

function emitAlert(data) {
  if (!io) return;
  io.to('admin').emit('alert:new', data);
  if (data.vehicleId) {
    io.to(`driver:${data.vehicleId}`).emit('alert:new', data);
  }
}

module.exports = {
  init,
  emitEnvironmentUpdate,
  emitADASAlert,
  emitRiskPrediction,
  emitAlert,
};
