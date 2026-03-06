import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";



actor {
  include MixinStorage();

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile System
  public type UserProfile = {
    username : Text;
    displayName : Text;
    avatarId : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Data Models
  public type Habit = {
    id : Nat;
    userId : Principal;
    name : Text;
    createdAt : Int;
    completions : [Int];
  };

  public type Task = {
    id : Nat;
    userId : Principal;
    title : Text;
    completed : Bool;
    createdAt : Int;
  };

  public type EntryType = {
    #income;
    #expense;
    #investment;
  };

  public type CashflowEntry = {
    id : Nat;
    userId : Principal;
    entryType : EntryType;
    entryLabel : Text;
    amount : Float;
    date : Int;
  };

  public type WealthGoal = {
    userId : Principal;
    goalAmount : Float;
  };

  public type CommunityChannel = {
    #announcements;
    #general;
  };

  public type CommunityMessage = {
    id : Nat;
    channel : CommunityChannel;
    authorPrincipal : Principal;
    authorUsername : Text;
    content : Text;
    imageId : ?Text;
    timestamp : Int;
  };

  public type DirectMessage = {
    id : Nat;
    fromPrincipal : Principal;
    fromUsername : Text;
    toPrincipal : Principal;
    content : Text;
    imageId : ?Text;
    timestamp : Int;
  };

  // Comparison Functions for Custom Types
  module Habit {
    public func compare(h1 : Habit, h2 : Habit) : Order.Order {
      Nat.compare(h1.id, h2.id);
    };
  };

  module Task {
    public func compare(t1 : Task, t2 : Task) : Order.Order {
      Nat.compare(t1.id, t2.id);
    };
  };

  module CashflowEntry {
    public func compare(c1 : CashflowEntry, c2 : CashflowEntry) : Order.Order {
      Nat.compare(c1.id, c2.id);
    };
  };

  module CommunityMessage {
    public func compare(cm1 : CommunityMessage, cm2 : CommunityMessage) : Order.Order {
      Int.compare(cm1.timestamp, cm2.timestamp);
    };
  };

  module DirectMessage {
    public func compare(dm1 : DirectMessage, dm2 : DirectMessage) : Order.Order {
      Int.compare(dm1.timestamp, dm2.timestamp);
    };
  };

  var habitIdCounter = 0;
  var taskIdCounter = 0;
  var cashflowIdCounter = 0;
  var messageIdCounter = 0;
  var directMessageIdCounter = 0;

  let habits = Map.empty<Nat, Habit>();
  let tasks = Map.empty<Nat, Task>();
  let cashflowEntries = Map.empty<Nat, CashflowEntry>();
  let wealthGoals = Map.empty<Principal, WealthGoal>();
  let communityMessages = Map.empty<Nat, CommunityMessage>();
  let directMessages = Map.empty<Nat, DirectMessage>();

  // Habits
  public shared ({ caller }) func addHabit(name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add habits");
    };

    let habitId = habitIdCounter;
    let habit : Habit = {
      id = habitId;
      userId = caller;
      name;
      createdAt = Time.now();
      completions = [];
    };

    habits.add(habitId, habit);
    habitIdCounter += 1;
    habitId;
  };

  public query ({ caller }) func getHabits() : async [Habit] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view habits");
    };

    habits.values().toArray().filter(func(h) { h.userId == caller }).sort();
  };

  public shared ({ caller }) func markHabitComplete(habitId : Nat, dayTimestamp : Int) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark habits complete");
    };

    switch (habits.get(habitId)) {
      case (?habit) {
        if (habit.userId != caller) {
          Runtime.trap("Unauthorized: Can only mark your own habits complete");
        };
        let updatedCompletions = habit.completions.concat([dayTimestamp]);
        let updatedHabit = { habit with completions = updatedCompletions };
        habits.add(habitId, updatedHabit);
        true;
      };
      case (null) { Runtime.trap("Habit not found") };
    };
  };

  public shared ({ caller }) func deleteHabit(habitId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete habits");
    };

    switch (habits.get(habitId)) {
      case (?habit) {
        if (habit.userId != caller) {
          Runtime.trap("Unauthorized: Can only delete your own habits");
        };
        habits.remove(habitId);
        true;
      };
      case (null) { false };
    };
  };

  // Tasks
  public shared ({ caller }) func addTask(title : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };

    let taskId = taskIdCounter;
    let task : Task = {
      id = taskId;
      userId = caller;
      title;
      completed = false;
      createdAt = Time.now();
    };

    tasks.add(taskId, task);
    taskIdCounter += 1;
    taskId;
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    tasks.values().toArray().filter(func(t) { t.userId == caller }).sort();
  };

  public shared ({ caller }) func completeTask(taskId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete tasks");
    };

    switch (tasks.get(taskId)) {
      case (?task) {
        if (task.userId != caller) {
          Runtime.trap("Unauthorized: Can only complete your own tasks");
        };
        let updatedTask = { task with completed = true };
        tasks.add(taskId, updatedTask);
        true;
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func deleteTask(taskId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    switch (tasks.get(taskId)) {
      case (?task) {
        if (task.userId != caller) {
          Runtime.trap("Unauthorized: Can only delete your own tasks");
        };
        tasks.remove(taskId);
        true;
      };
      case (null) { false };
    };
  };

  // Cashflow
  public shared ({ caller }) func addCashflowEntry(entryType : EntryType, entryLabel : Text, amount : Float, date : Int) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add cashflow entries");
    };

    let entryId = cashflowIdCounter;
    let entry : CashflowEntry = {
      id = entryId;
      userId = caller;
      entryType;
      entryLabel;
      amount;
      date;
    };

    cashflowEntries.add(entryId, entry);
    cashflowIdCounter += 1;
    entryId;
  };

  public query ({ caller }) func getCashflowEntries() : async [CashflowEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cashflow entries");
    };

    cashflowEntries.values().toArray().filter(func(e) { e.userId == caller }).sort();
  };

  public shared ({ caller }) func deleteCashflowEntry(entryId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete cashflow entries");
    };

    switch (cashflowEntries.get(entryId)) {
      case (?entry) {
        if (entry.userId != caller) {
          Runtime.trap("Unauthorized: Can only delete your own cashflow entries");
        };
        cashflowEntries.remove(entryId);
        true;
      };
      case (null) { false };
    };
  };

  public query ({ caller }) func getCashflowSummary() : async {
    totalIncome : Float;
    totalExpenses : Float;
    totalInvestments : Float;
    savings : Float;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cashflow summary");
    };

    var totalIncome = 0.0;
    var totalExpenses = 0.0;
    var totalInvestments = 0.0;

    cashflowEntries.values().toArray().forEach(
      func(entry) {
        if (entry.userId == caller) {
          switch (entry.entryType) {
            case (#income) { totalIncome += entry.amount };
            case (#expense) { totalExpenses += entry.amount };
            case (#investment) { totalInvestments += entry.amount };
          };
        };
      }
    );

    {
      totalIncome;
      totalExpenses;
      totalInvestments;
      savings = totalIncome - totalExpenses;
    };
  };

  // Wealth Goal
  public shared ({ caller }) func setWealthGoal(amount : Float) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set wealth goals");
    };

    let goal : WealthGoal = {
      userId = caller;
      goalAmount = amount;
    };
    wealthGoals.add(caller, goal);
    true;
  };

  public query ({ caller }) func getWealthGoal() : async ?Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wealth goals");
    };

    switch (wealthGoals.get(caller)) {
      case (?goal) { ?goal.goalAmount };
      case (null) { null };
    };
  };

  public query ({ caller }) func getWealthProgress() : async { goal : Float; currentSavings : Float; percentage : Float } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wealth progress");
    };

    let goalAmount = switch (wealthGoals.get(caller)) {
      case (?goal) { goal.goalAmount };
      case (null) { 0.0 };
    };

    var currentSavings = 0.0;
    cashflowEntries.values().toArray().forEach(
      func(entry) {
        if (entry.userId == caller) {
          switch (entry.entryType) {
            case (#income) { currentSavings += entry.amount };
            case (#expense) { currentSavings -= entry.amount };
            case (#investment) { () };
          };
        };
      }
    );

    {
      goal = goalAmount;
      currentSavings;
      percentage = if (goalAmount > 0.0) {
        (currentSavings / goalAmount) * 100.0;
      } else {
        0.0;
      };
    };
  };

  // Community
  public shared ({ caller }) func postToChannel(channel : CommunityChannel, content : Text, imageId : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post to channels");
    };

    // Admin-only check for announcements channel
    switch (channel) {
      case (#announcements) {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
          Runtime.trap("Unauthorized: Only admins can post to announcements");
        };
      };
      case (#general) { /* All users can post */ };
    };

    let authorUsername = switch (userProfiles.get(caller)) {
      case (?profile) { profile.username };
      case (null) { caller.toText() };
    };

    let messageId = messageIdCounter;
    let message : CommunityMessage = {
      id = messageId;
      channel;
      authorPrincipal = caller;
      authorUsername;
      content;
      imageId;
      timestamp = Time.now();
    };

    communityMessages.add(messageId, message);
    messageIdCounter += 1;
    messageId;
  };

  public query ({ caller }) func getChannelMessages(channel : CommunityChannel) : async [CommunityMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view channel messages");
    };

    communityMessages.values().toArray().filter(
      func(msg) { msg.channel == channel }
    ).sort();
  };

  public shared ({ caller }) func sendDirectMessage(toPrincipal : Principal, content : Text, imageId : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send direct messages");
    };

    let fromUsername = switch (userProfiles.get(caller)) {
      case (?profile) { profile.username };
      case (null) { caller.toText() };
    };

    let messageId = directMessageIdCounter;
    let message : DirectMessage = {
      id = messageId;
      fromPrincipal = caller;
      fromUsername;
      toPrincipal;
      content;
      imageId;
      timestamp = Time.now();
    };

    directMessages.add(messageId, message);
    directMessageIdCounter += 1;
    messageId;
  };

  public query ({ caller }) func getDirectMessages(otherPrincipal : Principal) : async [DirectMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view direct messages");
    };

    directMessages.values().toArray().filter(
      func(msg) {
        (msg.fromPrincipal == caller and msg.toPrincipal == otherPrincipal) or (msg.fromPrincipal == otherPrincipal and msg.toPrincipal == caller)
      }
    ).sort();
  };

  public query ({ caller }) func getConversationList() : async [{
    otherPrincipal : Principal;
    otherUsername : Text;
    lastMessage : Text;
    timestamp : Int;
  }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversation list");
    };

    let userMessages = directMessages.values().toArray().filter(
      func(msg) { msg.fromPrincipal == caller or msg.toPrincipal == caller }
    );

    let conversationMap = Map.empty<Principal, DirectMessage>();

    userMessages.forEach(
      func(msg) {
        let otherPrincipal = if (msg.fromPrincipal == caller) {
          msg.toPrincipal;
        } else {
          msg.fromPrincipal;
        };

        switch (conversationMap.get(otherPrincipal)) {
          case (?existingMsg) {
            if (msg.timestamp > existingMsg.timestamp) {
              conversationMap.add(otherPrincipal, msg);
            };
          };
          case (null) {
            conversationMap.add(otherPrincipal, msg);
          };
        };
      }
    );

    conversationMap.entries().toArray().map(
      func((otherPrincipal, msg) : (Principal, DirectMessage)) : {
        otherPrincipal : Principal;
        otherUsername : Text;
        lastMessage : Text;
        timestamp : Int;
      } {
        let otherUsername = if (msg.fromPrincipal == caller) {
          switch (userProfiles.get(msg.toPrincipal)) {
            case (?profile) { profile.username };
            case (null) { msg.toPrincipal.toText() };
          };
        } else {
          msg.fromUsername;
        };

        {
          otherPrincipal;
          otherUsername;
          lastMessage = msg.content;
          timestamp = msg.timestamp;
        };
      }
    );
  };

  public query ({ caller }) func getUserList() : async [{
    principal : Principal;
    username : Text;
    displayName : Text;
    avatarId : ?Text;
  }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user list");
    };

    userProfiles.entries().toArray().map(
      func((principal, profile) : (Principal, UserProfile)) : {
        principal : Principal;
        username : Text;
        displayName : Text;
        avatarId : ?Text;
      } {
        {
          principal;
          username = profile.username;
          displayName = profile.displayName;
          avatarId = profile.avatarId;
        };
      }
    );
  };

  public query ({ caller }) func isFounder() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
