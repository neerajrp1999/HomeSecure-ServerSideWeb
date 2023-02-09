let client = AgoraRTC.createClient({mode:'rtc', codec:"vp8"})

let config = {
    appid:'996cd7065aaa4a9e949eef589450ca80',
    token:'007eJxTYLh/IO+ua5mb0+sEQTk9i22Tux/VnvFnzv2+bdWrHDPb+kUKDJaWZskp5gZmpomJiSaJlqmWJpapqWmmFpYmpgbJiRYGxxrPJjcEMjKoSh9kZGSAQBCfjSEvNbUoMYuBAQC8MCDB',
    uid:null,
    channel:'neeraj',
}

let localTracks = {
    audioTrack:null,
    videoTrack:null,
}

let remoteTracks={}
window.onload = async function() {
document.documentElement.requestFullscreen();
   await joinStreams();

  };
let joinStreams = async () => {
    
    client.on("user-published",handleUserJoin );
    client.on("user-left",handleUserLeft );

    [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await  Promise.all([
        client.join(config.appid, config.channel, config.token ||null, config.uid ||null),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()

    ])
    let videoPlayer = `<div class="video-containers" id="video-wrapper-${config.uid}">
        <p class="user-uid"><img class="volume-icon" id="volume-${config.uid}" /> ${config.uid}</p>
        <div  class="video-player player" id="stream-${config.uid}"></div>
        </div>`
    document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer);
    localTracks.videoTrack.play(`stream-${config.uid}`)

    await client.publish([ localTracks.audioTrack, localTracks.videoTrack])

    client.on("user-published", handleUserJoin)
    document.getElementById('footer').style.display='inline';
}


let handleUserJoin = async (user,mediatype)=>{
    console.log('userJion')
    remoteTracks[user.uid]=user

    await client.subscribe(user,mediatype)

    let videoplayer=document.getElementById('video-wrapper-${user.uid}')
    if(videoplayer!=null){
        videoplayer.remove() 
    }
    if(mediatype === 'video'){
        let videoPlayer = `<div class="video-containers" id="video-wrapper-${user.uid}">
            <p class="user-uid"><img class="volume-icon" id="volume-${user.uid}" /> ${user.uid}</p>
            <div  class="video-player player" id="stream-${user.uid}"></div>
            </div>`
        document.getElementById('user-streams').insertAdjacentHTML('beforeend', videoPlayer);
        user.videoTrack.play(`stream-${user.uid}`)
    }
    if(mediatype === 'audio'){
        user.audioTrack.play()
    }

    
}


document.getElementById('leave-btn').addEventListener('click', async ()=> {
    window.close() ;
    for(trackname in localTracks){
        let track=localTracks[trackname]
        if(track){
            track.stop()
            track.close()
            localTracks[trackname]=null
        }
    }
    await client.leave()
    window.close();
    document.getElementById('user-streams').innerHTML=''
})
let localTrackState={
        audioTrackMuted:false,
        videoTrackMuted:false,
}
document.getElementById('mic-btn').addEventListener('click',async ()=> {
    if(!localTrackState.audioTrackMuted){
        await localTracks.audioTrack.setMuted(true);
        localTrackState.audioTrackMuted=true;
        document.getElementById('mic-btn').style.backgroundColor='rgb(255,80,80,0.6)'
    }else{
        await localTracks.audioTrack.setMuted(false);
        localTrackState.audioTrackMuted=false;
        document.getElementById('mic-btn').style.backgroundColor=''
    }
})

document.getElementById('camera-btn').addEventListener('click',async ()=> {
    if(!localTrackState.videoTrackMuted){
        await localTracks.videoTrack.setMuted(true);
        localTrackState.videoTrackMuted=true;
        document.getElementById('camera-btn').style.backgroundColor='rgb(255,80,80,0.6)'
    }else{
        await localTracks.videoTrack.setMuted(false);
        localTrackState.videoTrackMuted=false;
        document.getElementById('camera-btn').style.backgroundColor=''
    }
})

let handleUserLeft = async(user) => {
    console.log('Handle user left!')
    delete remoteTracks[user.uid]
    document.getElementById('video-wrapper-${user.uid}')

}
setTimeout(() => {
    window.close();
}, 120000);