export var AuctionState;
(function (AuctionState) {
    AuctionState[AuctionState["LIVE"] = 0] = "LIVE";
    AuctionState[AuctionState["ENDED"] = 1] = "ENDED";
    AuctionState[AuctionState["REVEALED"] = 2] = "REVEALED";
})(AuctionState || (AuctionState = {}));
export var UserState;
(function (UserState) {
    UserState[UserState["CAN_JOIN"] = 0] = "CAN_JOIN";
    UserState[UserState["CAN_BID"] = 1] = "CAN_BID";
    UserState[UserState["BID_SUBMITTED"] = 2] = "BID_SUBMITTED";
})(UserState || (UserState = {}));
