import React, { useEffect, useEffect as useRoomSync } from 'react';

interface ChatRoomProps {
  roomId: string;
  connectToChat: (roomId: string) => () => void;
}

export function ChatRoom({ roomId, connectToChat }: ChatRoomProps) {
  // effect: Subscribe to the current chat room and disconnect when it changes.
  useEffect(() => connectToChat(roomId), [connectToChat, roomId]);
  return <h2>Room {roomId}</h2>;
}

export function UnexplainedChatRoom({ roomId, connectToChat }: ChatRoomProps) {
  // expect: error sonsu-lee(require-effect-reason) -- The room subscription has no stated purpose.
  useEffect(() => connectToChat(roomId), [connectToChat, roomId]);
  return <h2>Room {roomId}</h2>;
}

export function AliasedChatRoom({ roomId, connectToChat }: ChatRoomProps) {
  // expect: error sonsu-lee(require-effect-reason) -- The alias still starts the room subscription.
  useRoomSync(() => connectToChat(roomId), [connectToChat, roomId]);
  return <h2>Room {roomId}</h2>;
}

export function ChatComposer({
  roomId,
  focusComposer,
}: {
  roomId: string;
  focusComposer: (id: string) => void;
}) {
  // expect: error sonsu-lee(require-effect-reason) -- The layout Effect moves focus without stating why.
  React.useLayoutEffect(() => focusComposer(roomId), [focusComposer, roomId]);
  return <textarea aria-label={`Message for room ${roomId}`} />;
}
