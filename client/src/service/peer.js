class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
  }

  async getAnswer(offer) {
    if (this.peer) {
      try {
        await this.peer.setRemoteDescription(offer);
        const ans = await this.peer.createAnswer();
        await this.peer.setLocalDescription(ans);
        return ans;
      } catch (error) {
        console.error("Failed to create and set answer:", error);
      }
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      try {
        await this.peer.setRemoteDescription(ans);
      } catch (error) {
        console.error("Failed to set remote description:", error);
      }
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      console.log("Offer 2 is");
      return offer;
    }
  }
}

export default new PeerService();
