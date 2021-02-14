export interface Conversation {
  id: number;

  /** Token identifier of the conversation which is used for further interaction */
  token: string;

  /**See list of conversation types in the constants list */
  type: ConversationType;

  /** Name of the conversation (can also be empty) */
  name: string;

  /** name if non empty, otherwise it falls back to a list of participants */
  displayName: string;

  /**
   * Description of the conversation (can also be empty) (only available with room-description capability)
   * @since v3
   */
  description: string;

  /** Permissions level of the current user */
  participantType: ParticipantType;

  // attendeeId 	int 	v3 	Unique attendee id
  // attendeePin 	string 	v3 	Unique dial-in authentication code for this user, when the conversation has SIP enabled (see sipEnabled attribute)
  // actorType 	string 	v3 	Currently known users|guests|emails|groups
  // actorId 	string 	v3 	The unique identifier for the given actor type

  /**
   * Flag if the current user is in the call (deprecated, use participantFlags instead)
   * @since v1
   */
  participantInCall: boolean;

  /** Flags of the current user (only available with in-call-flags capability) */
  participantFlags: ParticipantInCallFlag;

  /** Read-only state for the current user (only available with read-only-rooms capability) */
  readOnly: ReadonlyState;

  // listable 	int 	* 	Listable scope for the room (only available with listable-rooms capability)

  /**
   * Number of active users
   * @since v1
   * @deprecated always returns 0
   */
  count: number;

  /**
   * Number of active guests
   * @since v1
   */
  numGuests: number;

  /** Timestamp of the last ping of the current user (should be used for sorting) */
  lastPing: number;

  /** '0' if not connected, otherwise a 512 character long string */
  sessionId: string;

  /** Flag if the conversation has a password */
  hasPassword: boolean;

  /** Flag if the conversation has an active call */
  hasCall: boolean;

  /** Flag if the user can start a new call in this conversation (joining is always possible) (only available with start-call-flag capability) */
  canStartCall: boolean;

  // canDeleteConversation 	bool 	🆕 v2 	Flag if the user can delete the conversation for everyone (not possible without moderator permissions or in one-to-one conversations)
  // canLeaveConversation 	bool 	🆕 v2 	Flag if the user can leave the conversation (not possible for the last user with moderator permissions)

  /** Timestamp of the last activity in the conversation, in seconds and UTC time zone */
  lastActivity: number;

  /** Flag if the conversation is favorited by the user */
  isFavorite: boolean;

  /** The notification level for the user (one of Participant::NOTIFY_* (1-3)) */
  notificationLevel: number;

  /** Webinary lobby restriction (0-1), if the participant is a moderator they can always join the conversation (only available with webinary-lobby capability) */
  lobbyState: WebinaryLobbyState;

  /** Timestamp when the lobby will be automatically disabled (only available with webinary-lobby capability) */
  lobbyTimer: number;

  // sipEnabled 	int 	v3 	SIP enable status (0-1)
  // canEnableSIP 	int 	v3 	Whether the given user can enable SIP for this conversation. Note that when the token is not-numeric only, SIP can not be enabled even if the user is permitted and a moderator of the conversation

  /** Number of unread chat messages in the conversation (only available with chat-v2 capability) */
  unreadMessages: number;

  /** Flag if the user was mentioned since their last visit */
  unreadMention: boolean;

  /** ID of the last read message in a room (only available with chat-read-marker capability) */
  lastReadMessage: number;

  // lastCommonReadMessage 	int 	v3 	ID of the last message read by every user that has read privacy set to public in a room. When the user themself has it set to private the value is 0 (only available with chat-read-status capability)

  /** Last message in a conversation if available, otherwise empty */
  lastMessage: Message;

  /** The type of object that the conversation is associated with; "share:password" if the conversation is used to request a password for a share, otherwise empty */
  objectType: string;

  /** Share token if "objectType" is "share:password", otherwise empty */
  objectId: string;

  // TODO: undocumented property
  participants: { [userName: string]: string };

  // TODO: guestList: any
}

export interface Message {
  /** ID of the comment */
  id: number;

  /** Conversation token */
  token: string;

  /** guests or users */
  actorType: string;

  /** User id of the message author */
  actorId: string;

  /** Display name of the message author */
  actorDisplayName: string;

  /** Timestamp in seconds and UTC time zone */
  timestamp: number;

  /** empty for normal chat message or the type of the system message (untranslated) */
  systemMessage: string;

  /** Currently known types are comment, comment_deleted, system and command */
  messageType: string;

  /** True if the user can post a reply to this message (only available with chat-replies capability) */
  isReplyable: boolean;

  /** A reference string that was given while posting the message to be able to identify a sent message again (only available with chat-reference-id capability) */
  referenceId: string;

  /** Message string with placeholders (see Rich Object String) */
  message: string;

  /** Message parameters for message (see Rich Object String) */
  messageParameters: any[];

  /** See Parent data below */
  parent?: any[];
}

export enum ActorType {
  /** guest users */
  Guests = "guests",
  /** logged-in users */
  Users = "users",
  /** used by commands (actor-id is the used /command) and the changelog conversation (actor-id is changelog) */
  Bots = "bots",
}

export enum ConversationType {
  OneToOne = 1,
  Group = 2,
  Public = 3,
  Changelog = 4,
}

export enum ListableScope {
  ParticipantsOnly = 0,
  RegularUsersOnly = 1,
  Everyone = 2,
}

export enum ParticipantInCallFlag {
  Disconnected = 0,
  InCall = 1,
  ProvidesAudio = 2,
  ProvidesVideo = 4,
}

export enum ParticipantNotificationLevel {
  /** 1 for one-to-one conversations, 2 for other conversations */
  Default = 0,
  AlwaysNotify = 1,
  NotifyOnMention = 2,
  NeverNotify = 3,
}

export enum ParticipantReadStatusPrivacy {
  Public = 0,
  Private = 1,
}

export enum ParticipantType {
  Owner = 1,
  Moderator = 2,
  User = 3,
  Guest = 4,
  UserFollowingAPublicLink = 5,
  GuestWithModeratorPermissions = 6,
}

export enum ReadonlyState {
  ReadWrite = 0,
  ReadOnly = 1,
}

export enum SignalingMode {
  /** No external signaling server is used */
  Internal = "internal",
  /** A single external signaling server is used */
  External = "external",
  /** An external signaling server is assigned per conversation */
  ConversationCluster = "conversation_cluster",
}

export enum WebinaryLobbyState {
  NoLobby = 0,
  LobbyForNonModerators = 1,
}
