import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  ///////////////////////////////////////////////////////////
  // DATA TYPES & MODULES
  ///////////////////////////////////////////////////////////

  type Hash = Text;

  // User Data
  type User = {
    firstName : Text;
    lastName : Text;
    mobileNumber : Text;
    passwordHash : Hash;
    isPremium : Bool;
    premiumExpiresAt : ?Time.Time;
  };

  // User Profile (for AccessControl system)
  public type UserProfile = {
    firstName : Text;
    lastName : Text;
    mobileNumber : Text;
    isPremium : Bool;
    premiumExpiresAt : ?Time.Time;
  };

  // Video Data
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

  // Watch Progress
  type WatchProgress = {
    videoId : Nat;
    watchedSeconds : Nat;
    completed : Bool;
    lastWatchedAt : Time.Time;
  };

  // Premium Subscription
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

  // Payment Settings
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
      Int.compare(wp2.lastWatchedAt, wp1.lastWatchedAt); // Descending order
    };
  };

  ///////////////////////////////////////////////////////////
  // STATE
  ///////////////////////////////////////////////////////////
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Stores
  let users = Map.empty<Principal, User>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let mobileNumberToPrincipal = Map.empty<Text, Principal>();
  let videos = Map.empty<Nat, Video>();
  let premiumRequests = Map.empty<Nat, PremiumRequest>();
  let watchProgress = Map.empty<Principal, Map.Map<Nat, WatchProgress>>();

  var nextVideoId = 1;
  var nextPremiumRequestId = 1;

  // Payment Settings
  var paymentUpiId : Text = "ksrpfm@upi";
  var paymentQrCodeUrl : Text = "";

  ///////////////////////////////////////////////////////////
  // VIDEO INIT (Hardcoded for demonstration)
  ///////////////////////////////////////////////////////////
  let sampleVideos = [
    // Romance videos
    {
      title = "Sunset Love";
      description = "A romantic tale set against the backdrop of a beautiful sunset.";
      thumbnailUrl = "https://example.com/thumbnails/sunset_love.jpg";
      videoUrl = "https://example.com/videos/sunset_love.mp4";
      genre = #Romance : Genre;
      durationSeconds = 5400;
    },
    {
      title = "Heartbeats";
      description = "A story about finding love in unexpected places.";
      thumbnailUrl = "https://example.com/thumbnails/heartbeats.jpg";
      videoUrl = "https://example.com/videos/heartbeats.mp4";
      genre = #Romance : Genre;
      durationSeconds = 6200;
    },
    {
      title = "Love's Journey";
      description = "Two souls embark on a journey of love and discovery.";
      thumbnailUrl = "https://example.com/thumbnails/loves_journey.jpg";
      videoUrl = "https://example.com/videos/loves_journey.mp4";
      genre = #Romance : Genre;
      durationSeconds = 7200;
    },
    // Thriller videos
    {
      title = "Midnight Chase";
      description = "A high-stakes thriller that will keep you on the edge of your seat.";
      thumbnailUrl = "https://example.com/thumbnails/midnight_chase.jpg";
      videoUrl = "https://example.com/videos/midnight_chase.mp4";
      genre = #Thriller : Genre;
      durationSeconds = 5400;
    },
    {
      title = "Dark Secrets";
      description = "Unravel the mystery behind hidden secrets.";
      thumbnailUrl = "https://example.com/thumbnails/dark_secrets.jpg";
      videoUrl = "https://example.com/videos/dark_secrets.mp4";
      genre = #Thriller : Genre;
      durationSeconds = 6200;
    },
    {
      title = "Chasing Shadows";
      description = "A detective's quest to catch a notorious criminal.";
      thumbnailUrl = "https://example.com/thumbnails/chasing_shadows.jpg";
      videoUrl = "https://example.com/videos/chasing_shadows.mp4";
      genre = #Thriller : Genre;
      durationSeconds = 7200;
    },
    // Action videos
    {
      title = "Fast Lane";
      description = "Adrenaline-pumping action in a high-speed race.";
      thumbnailUrl = "https://example.com/thumbnails/fast_lane.jpg";
      videoUrl = "https://example.com/videos/fast_lane.mp4";
      genre = #Action : Genre;
      durationSeconds = 5400;
    },
    {
      title = "Warrior's Path";
      description = "Follow the journey of a skilled warrior in battle.";
      thumbnailUrl = "https://example.com/thumbnails/warriors_path.jpg";
      videoUrl = "https://example.com/videos/warriors_path.mp4";
      genre = #Action : Genre;
      durationSeconds = 6200;
    },
    {
      title = "Battlefield";
      description = "Epic action scenes in a war-torn battlefield.";
      thumbnailUrl = "https://example.com/thumbnails/battlefield.jpg";
      videoUrl = "https://example.com/videos/battlefield.mp4";
      genre = #Action : Genre;
      durationSeconds = 7200;
    },
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

  ///////////////////////////////////////////////////////////
  // USER PROFILE APIS (Required by AccessControl)
  ///////////////////////////////////////////////////////////

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
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

  ///////////////////////////////////////////////////////////
  // AUTH SYSTEM
  ///////////////////////////////////////////////////////////

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

    // Create user profile
    let profile : UserProfile = {
      firstName;
      lastName;
      mobileNumber;
      isPremium = false;
      premiumExpiresAt = null;
    };
    userProfiles.add(caller, profile);

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
        // Users can only view their own data, admins can view any
        if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own user data");
        };
        users.get(principal);
      };
      case (null) { null };
    };
  };

  ///////////////////////////////////////////////////////////
  // VIDEO CATALOG APIS
  ///////////////////////////////////////////////////////////

  public query ({ caller }) func listAllVideos() : async [Video] {
    // Public access - anyone can list videos (including guests)
    videos.values().toArray().sort();
  };

  public query ({ caller }) func listVideosByGenre(genre : Genre) : async [Video] {
    // Public access - anyone can list videos by genre (including guests)
    videos.values().toArray().filter(func(video) { video.genre == genre });
  };

  public query ({ caller }) func getVideoById(id : Nat) : async ?Video {
    // Public access - anyone can get video details (including guests)
    videos.get(id);
  };

  ///////////////////////////////////////////////////////////
  // WATCH PROGRESS APIS
  ///////////////////////////////////////////////////////////

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

        // Check if user has access to premium content
        if (video.isPremiumOnly and not user.isPremium) {
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

  ///////////////////////////////////////////////////////////
  // PREMIUM SUBSCRIPTION APIS
  ///////////////////////////////////////////////////////////

  public shared ({ caller }) func submitPremiumRequest(plan : PremiumPlan, utrId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit premium requests");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?_) {
        let request : PremiumRequest = {
          id = nextPremiumRequestId;
          userId = caller;
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
          let premiumDuration = switch (request.plan) {
            case (#Monthly) { 30 * 24 * 60 * 60 };
            case (#Yearly) { 365 * 24 * 60 * 60 };
          };

          switch (users.get(request.userId)) {
            case (null) { () };
            case (?user) {
              let updatedUser = {
                user with
                isPremium = true;
                premiumExpiresAt = ?(Time.now() + premiumDuration * 1_000_000_000); // nanoseconds
              };
              users.add(request.userId, updatedUser);

              // Update user profile
              switch (userProfiles.get(request.userId)) {
                case (?profile) {
                  let updatedProfile = {
                    profile with
                    isPremium = true;
                    premiumExpiresAt = ?(Time.now() + premiumDuration * 1_000_000_000);
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

  public query ({ caller }) func getUserPremiumStatus() : async (Bool, ?Time.Time) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view premium status");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        (user.isPremium, user.premiumExpiresAt);
      };
    };
  };

  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  ///////////////////////////////////////////////////////////
  // PAYMENT SETTINGS APIS
  ///////////////////////////////////////////////////////////

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
};
