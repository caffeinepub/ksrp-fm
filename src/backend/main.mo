import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Hash = Text;

  // Stable types kept exactly as before — no new fields to preserve upgrade compatibility
  type User = {
    firstName : Text;
    lastName : Text;
    mobileNumber : Text;
    passwordHash : Hash;
    isPremium : Bool;
    premiumExpiresAt : ?Time.Time;
  };

  public type UserProfile = {
    firstName : Text;
    lastName : Text;
    mobileNumber : Text;
    isPremium : Bool;
    premiumExpiresAt : ?Time.Time;
  };

  public type UserRecord = {
    principal : Principal;
    firstName : Text;
    lastName : Text;
    mobileNumber : Text;
    isPremium : Bool;
    premiumExpiresAt : ?Time.Time;
  };

  type Genre = {
    #Romance;
    #Thriller;
    #Action;
  };

  module Genre {
    public func compare(genre1 : Genre, genre2 : Genre) : Order.Order {
      switch (genre1, genre2) {
        case (#Thriller, #Thriller) { #equal };
        case (#Thriller, _) { #less };
        case (#Romance, #Romance) { #equal };
        case (#Romance, #Thriller) { #greater };
        case (#Romance, _) { #less };
        case (#Action, #Action) { #equal };
        case (#Action, _) { #greater };
      };
    };
  };

  type Video = {
    id : Nat;
    title : Text;
    description : Text;
    thumbnailUrl : Text;
    videoUrl : Text;
    genre : Genre;
    durationSeconds : Nat;
    createdAt : Time.Time;
    isPremiumOnly : Bool;
  };

  type WatchProgress = {
    videoId : Nat;
    watchedSeconds : Nat;
    completed : Bool;
    lastWatchedAt : Time.Time;
  };

  type PremiumPlan = {
    #Monthly;
    #Yearly;
  };

  type PremiumRequestStatus = {
    #Pending;
    #Approved;
    #Rejected;
  };

  type PremiumRequest = {
    id : Nat;
    userId : Principal;
    plan : PremiumPlan;
    utrId : Text;
    status : PremiumRequestStatus;
    submittedAt : Time.Time;
    reviewedAt : ?Time.Time;
  };

  public type HelpDeskRequest = {
    id : Nat;
    name : Text;
    phoneNumber : Text;
    problem : Text;
    submittedAt : Time.Time;
  };

  public type PaymentSettings = {
    upiId : Text;
    qrCodeUrl : Text;
  };

  module Video {
    public func compare(video1 : Video, video2 : Video) : Order.Order {
      Nat.compare(video1.id, video2.id);
    };
  };

  module WatchProgress {
    public func compare(wp1 : WatchProgress, wp2 : WatchProgress) : Order.Order {
      Nat.compare(wp1.videoId, wp2.videoId);
    };

    public func compareByLastWatched(wp1 : WatchProgress, wp2 : WatchProgress) : Order.Order {
      Int.compare(wp2.lastWatchedAt, wp1.lastWatchedAt);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let users = Map.empty<Principal, User>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let mobileNumberToPrincipal = Map.empty<Text, Principal>();
  let videos = Map.empty<Nat, Video>();
  let premiumRequests = Map.empty<Nat, PremiumRequest>();
  let watchProgress = Map.empty<Principal, Map.Map<Nat, WatchProgress>>();

  // New separate stable map for premium plan — avoids breaking User/UserProfile stable types
  let userPremiumPlan = Map.empty<Principal, Text>();

  var nextVideoId = 1;
  var nextPremiumRequestId = 1;

  var paymentUpiId : Text = "ksrpfm@upi";
  var paymentQrCodeUrl : Text = "";

  let helpDeskRequests = Map.empty<Nat, HelpDeskRequest>();
  var nextHelpDeskId = 1;

  let sampleVideos = [
    { title = "Sunset Love"; description = "A romantic tale set against the backdrop of a beautiful sunset."; thumbnailUrl = "https://example.com/thumbnails/sunset_love.jpg"; videoUrl = "https://example.com/videos/sunset_love.mp4"; genre = #Romance : Genre; durationSeconds = 5400; },
    { title = "Heartbeats"; description = "A story about finding love in unexpected places."; thumbnailUrl = "https://example.com/thumbnails/heartbeats.jpg"; videoUrl = "https://example.com/videos/heartbeats.mp4"; genre = #Romance : Genre; durationSeconds = 6200; },
    { title = "Love's Journey"; description = "Two souls embark on a journey of love and discovery."; thumbnailUrl = "https://example.com/thumbnails/loves_journey.jpg"; videoUrl = "https://example.com/videos/loves_journey.mp4"; genre = #Romance : Genre; durationSeconds = 7200; },
    { title = "Midnight Chase"; description = "A high-stakes thriller that will keep you on the edge of your seat."; thumbnailUrl = "https://example.com/thumbnails/midnight_chase.jpg"; videoUrl = "https://example.com/videos/midnight_chase.mp4"; genre = #Thriller : Genre; durationSeconds = 5400; },
    { title = "Dark Secrets"; description = "Unravel the mystery behind hidden secrets."; thumbnailUrl = "https://example.com/thumbnails/dark_secrets.jpg"; videoUrl = "https://example.com/videos/dark_secrets.mp4"; genre = #Thriller : Genre; durationSeconds = 6200; },
    { title = "Chasing Shadows"; description = "A detective's quest to catch a notorious criminal."; thumbnailUrl = "https://example.com/thumbnails/chasing_shadows.jpg"; videoUrl = "https://example.com/videos/chasing_shadows.mp4"; genre = #Thriller : Genre; durationSeconds = 7200; },
    { title = "Fast Lane"; description = "Adrenaline-pumping action in a high-speed race."; thumbnailUrl = "https://example.com/thumbnails/fast_lane.jpg"; videoUrl = "https://example.com/videos/fast_lane.mp4"; genre = #Action : Genre; durationSeconds = 5400; },
    { title = "Warrior's Path"; description = "Follow the journey of a skilled warrior in battle."; thumbnailUrl = "https://example.com/thumbnails/warriors_path.jpg"; videoUrl = "https://example.com/videos/warriors_path.mp4"; genre = #Action : Genre; durationSeconds = 6200; },
    { title = "Battlefield"; description = "Epic action scenes in a war-torn battlefield."; thumbnailUrl = "https://example.com/thumbnails/battlefield.jpg"; videoUrl = "https://example.com/videos/battlefield.mp4"; genre = #Action : Genre; durationSeconds = 7200; },
  ];

  for (video in sampleVideos.values()) {
    let videoData : Video = {
      id = nextVideoId;
      title = video.title;
      description = video.description;
      thumbnailUrl = video.thumbnailUrl;
      videoUrl = video.videoUrl;
      genre = video.genre;
      durationSeconds = video.durationSeconds;
      createdAt = Time.now();
      isPremiumOnly = true;
    };
    videos.add(nextVideoId, videoData);
    nextVideoId += 1;
  };

  // Helper: check if a user's premium is currently active (not expired)
  func isUserPremiumActive(user : User) : Bool {
    if (not user.isPremium) { return false };
    switch (user.premiumExpiresAt) {
      case (null) { false };
      case (?expiresAt) { Time.now() < expiresAt };
    };
  };

  // Safe helper: check if caller has a role without trapping
  func callerHasRole(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not callerHasRole(caller)) { return null };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Returns the caller's active premium plan label ("Monthly" or "Yearly"), or null
  public query ({ caller }) func getUserPremiumPlan() : async ?Text {
    if (not callerHasRole(caller)) { return null };
    // Only return plan if premium is still active
    switch (users.get(caller)) {
      case (null) { null };
      case (?user) {
        if (isUserPremiumActive(user)) {
          userPremiumPlan.get(caller);
        } else {
          null;
        };
      };
    };
  };

  public shared ({ caller }) func register(firstName : Text, lastName : Text, mobileNumber : Text, passwordHash : Hash) : async Bool {
    if (mobileNumberToPrincipal.containsKey(mobileNumber)) {
      Runtime.trap("Mobile number already registered");
    };

    let newUser : User = {
      firstName;
      lastName;
      mobileNumber;
      passwordHash;
      isPremium = false;
      premiumExpiresAt = null;
    };

    users.add(caller, newUser);
    mobileNumberToPrincipal.add(mobileNumber, caller);

    let profile : UserProfile = {
      firstName;
      lastName;
      mobileNumber;
      isPremium = false;
      premiumExpiresAt = null;
    };
    userProfiles.add(caller, profile);

    switch (accessControlState.userRoles.get(caller)) {
      case (null) { accessControlState.userRoles.add(caller, #user) };
      case (?_) {};
    };

    true;
  };

  public query ({ caller }) func login(mobileNumber : Text, passwordHash : Hash) : async Bool {
    switch (mobileNumberToPrincipal.get(mobileNumber)) {
      case (?principal) {
        switch (users.get(principal)) {
          case (?user) {
            if (user.passwordHash == passwordHash) { return true };
            Runtime.trap("Invalid credentials");
          };
          case (null) { Runtime.trap("Invalid credentials") };
        };
      };
      case (null) { Runtime.trap("Invalid credentials") };
    };
  };

  public query ({ caller }) func getUser(mobileNumber : Text) : async ?User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view user data");
    };

    switch (mobileNumberToPrincipal.get(mobileNumber)) {
      case (?principal) {
        if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own user data");
        };
        users.get(principal);
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func listAllVideos() : async [Video] {
    videos.values().toArray().sort();
  };

  public query ({ caller }) func listVideosByGenre(genre : Genre) : async [Video] {
    videos.values().toArray().filter(func(video) { video.genre == genre });
  };

  public query ({ caller }) func getVideoById(id : Nat) : async ?Video {
    videos.get(id);
  };

  public shared ({ caller }) func recordProgress(videoId : Nat, watchedSeconds : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record progress");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let video = switch (videos.get(videoId)) {
          case (null) { Runtime.trap("Video not found") };
          case (?video) { video };
        };

        // Check actual premium expiry, not just the stored boolean
        if (video.isPremiumOnly and not isUserPremiumActive(user)) {
          Runtime.trap("Premium subscription required to watch this video");
        };

        let isCompleted = watchedSeconds >= (video.durationSeconds * 90 / 100);
        let userProgress = switch (watchProgress.get(caller)) {
          case (null) { Map.empty<Nat, WatchProgress>() };
          case (?progress) { progress };
        };

        let progress : WatchProgress = {
          videoId;
          watchedSeconds;
          completed = isCompleted;
          lastWatchedAt = Time.now();
        };

        userProgress.add(videoId, progress);
        watchProgress.add(caller, userProgress);
        true;
      };
    };
  };

  public query ({ caller }) func getContinueWatching() : async [WatchProgress] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view watch progress");
    };

    switch (watchProgress.get(caller)) {
      case (null) { [] };
      case (?progressMap) {
        progressMap.values().toArray().filter(func(p) { not p.completed }).sort(WatchProgress.compareByLastWatched);
      };
    };
  };

  public query ({ caller }) func getWatchProgress(videoId : Nat) : async ?WatchProgress {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view watch progress");
    };

    switch (watchProgress.get(caller)) {
      case (null) { null };
      case (?progressMap) { progressMap.get(videoId) };
    };
  };

  public shared ({ caller }) func submitPremiumRequest(plan : PremiumPlan, utrId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit premium requests");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?_) {
        let request : PremiumRequest = {
          id = nextPremiumRequestId;
          userId = caller; // Premium tied to this specific user Principal only
          plan;
          utrId;
          status = #Pending;
          submittedAt = Time.now();
          reviewedAt = null;
        };

        premiumRequests.add(nextPremiumRequestId, request);
        nextPremiumRequestId += 1;
        request.id;
      };
    };
  };

  public query ({ caller }) func getPremiumRequests() : async [PremiumRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all premium requests");
    };
    premiumRequests.values().toArray().sort(func(a, b) { Nat.compare(a.id, b.id) });
  };

  public query ({ caller }) func getPendingPremiumRequests() : async [PremiumRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending premium requests");
    };
    premiumRequests.values().toArray().filter(func(r) { r.status == #Pending });
  };

  public shared ({ caller }) func verifyPremiumRequest(requestId : Nat, approve : Bool) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can verify premium requests");
    };

    switch (premiumRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) {
        let updatedRequest = {
          request with
          status = if (approve) { #Approved } else { #Rejected };
          reviewedAt = ?Time.now();
        };
        premiumRequests.add(requestId, updatedRequest);

        if (approve) {
          // Duration in nanoseconds: 30 days for Monthly, 365 days for Yearly
          let premiumDurationNanos : Int = switch (request.plan) {
            case (#Monthly) { 30 * 24 * 60 * 60 * 1_000_000_000 };
            case (#Yearly)  { 365 * 24 * 60 * 60 * 1_000_000_000 };
          };
          let planLabel : Text = switch (request.plan) {
            case (#Monthly) { "Monthly" };
            case (#Yearly)  { "Yearly" };
          };

          // Apply premium ONLY to the specific userId that submitted this request
          switch (users.get(request.userId)) {
            case (null) { () };
            case (?user) {
              let expiresAt = Time.now() + premiumDurationNanos;
              let updatedUser = {
                user with
                isPremium = true;
                premiumExpiresAt = ?expiresAt;
              };
              users.add(request.userId, updatedUser);

              // Store the plan label separately
              userPremiumPlan.add(request.userId, planLabel);

              switch (userProfiles.get(request.userId)) {
                case (?profile) {
                  let updatedProfile = {
                    profile with
                    isPremium = true;
                    premiumExpiresAt = ?expiresAt;
                  };
                  userProfiles.add(request.userId, updatedProfile);
                };
                case (null) { () };
              };
            };
          };
        };

        true;
      };
    };
  };

  // Returns actual active premium status with expiry check
  public query ({ caller }) func getUserPremiumStatus() : async (Bool, ?Time.Time) {
    if (not callerHasRole(caller)) { return (false, null) };
    switch (users.get(caller)) {
      case (null) { (false, null) };
      case (?user) {
        let active = isUserPremiumActive(user);
        (active, user.premiumExpiresAt);
      };
    };
  };

  public query ({ caller }) func isAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  public shared ({ caller }) func activateAdminWithCode(code : Text) : async Bool {
    if (caller.isAnonymous()) { return false };
    if (code != "1000") { return false };
    accessControlState.userRoles.add(caller, #admin);
    true;
  };

  public query func getPaymentSettings() : async PaymentSettings {
    { upiId = paymentUpiId; qrCodeUrl = paymentQrCodeUrl };
  };

  public shared ({ caller }) func updatePaymentSettings(upiId : Text, qrCodeUrl : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payment settings");
    };
    paymentUpiId := upiId;
    paymentQrCodeUrl := qrCodeUrl;
    true;
  };

  // Admin: add a new video
  public shared ({ caller }) func addVideo(title : Text, description : Text, videoUrl : Text, thumbnailUrl : Text, genre : Genre, durationSeconds : Nat, isPremiumOnly : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add videos");
    };
    let videoData : Video = {
      id = nextVideoId;
      title = title;
      description = description;
      thumbnailUrl = thumbnailUrl;
      videoUrl = videoUrl;
      genre = genre;
      durationSeconds = durationSeconds;
      createdAt = Time.now();
      isPremiumOnly = isPremiumOnly;
    };
    videos.add(nextVideoId, videoData);
    let newId = nextVideoId;
    nextVideoId += 1;
    newId;
  };

  // Admin: delete a video
  public shared ({ caller }) func deleteVideo(videoId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };
    switch (videos.get(videoId)) {
      case (null) { false };
      case (?_) {
        videos.remove(videoId);
        true;
      };
    };
  };

  // Admin: get all registered users with their details
  public query ({ caller }) func getAllUserProfiles() : async [UserRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.entries().toArray().map(func((p, profile) : (Principal, UserProfile)) : UserRecord {
      let isPremiumActive = switch (users.get(p)) {
        case (null) { false };
        case (?user) { isUserPremiumActive(user) };
      };
      let expiresAt = switch (users.get(p)) {
        case (null) { null };
        case (?user) { user.premiumExpiresAt };
      };
      {
        principal = p;
        firstName = profile.firstName;
        lastName = profile.lastName;
        mobileNumber = profile.mobileNumber;
        isPremium = isPremiumActive;
        premiumExpiresAt = expiresAt;
      };
    });
  };

  // Anyone can submit a help desk request
  public shared func submitHelpDeskRequest(name : Text, phoneNumber : Text, problem : Text) : async Nat {
    let req : HelpDeskRequest = {
      id = nextHelpDeskId;
      name = name;
      phoneNumber = phoneNumber;
      problem = problem;
      submittedAt = Time.now();
    };
    helpDeskRequests.add(nextHelpDeskId, req);
    let newId = nextHelpDeskId;
    nextHelpDeskId += 1;
    newId;
  };

  // Admin: list all help desk requests
  public query ({ caller }) func listHelpDeskRequests() : async [HelpDeskRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view help desk requests");
    };
    helpDeskRequests.values().toArray();
  };

};
