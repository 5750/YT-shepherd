(async function () {
	let settings = await browser.storage.local.get(["InspireList", "NeutralList", "AvoidList"]);
	let InspireList = settings.InspireList || [];
	let NeutralList = settings.NeutralList || [];
	let AvoidList   = settings.AvoidList   || [];

	function createAddToListButton() {
		let btn = document.createElement("btn");
		btn.className = "YT-Shepherd-button";
		btn.textContent = "+";
		return btn;
	}

	async function assignListBtnHandler(ev, listName, channelId, videoTile) {
		ev.stopPropagation();
		let targetList = (await browser.storage.local.get(listName))[listName];
		targetList.push(channelId);
		await browser.storage.local.set({[listName]: targetList});
		videoTile.setAttribute("ListAssigned", listName);
	}

	async function unassignListBtnHandler(ev, channelId, videoTile) {
		ev.stopPropagation();
		let {AvoidList,NeutralList,InspireList} = await browser.storage.local.get(["AvoidList","NeutralList","InspireList"]);
		AvoidList   = AvoidList  .filter((el) => el !== channelId);
		NeutralList = NeutralList.filter((el) => el !== channelId);
		InspireList = InspireList.filter((el) => el !== channelId);
		await browser.storage.local.set({AvoidList, NeutralList, InspireList});
		videoTile.setAttribute("ListAssigned", "none");
	}

	function createTheButtons(videoTile, channelElement, channelId) {
		let btnContainer = document.createElement("div");
		btnContainer.className = "YT-Shepherd-buttons-container";
		channelElement.append(btnContainer);
		let btnInspire  = createAddToListButton();
		let btnNeutral  = createAddToListButton();
		let btnAvoid    = createAddToListButton();
		let btnUnassign = createAddToListButton();
		btnInspire .style.background = "green";
		btnNeutral .style.background = "yellow";
		btnAvoid   .style.background = "red";
		btnUnassign.style.background = "cyan";
		btnUnassign.classList.add("unassignBtn");
		btnContainer.appendChild(btnInspire);
		btnContainer.appendChild(btnNeutral);
		btnContainer.appendChild(btnAvoid);
		btnContainer.appendChild(btnUnassign);
		let assignListBtnHandlerWrapped = (ev, listName) => {
			ev.stopPropagation(); assignListBtnHandler(ev, listName, channelId, videoTile);
		}
		btnInspire .addEventListener("click", (ev) => assignListBtnHandlerWrapped(ev, "InspireList"), false);
		btnNeutral .addEventListener("click", (ev) => assignListBtnHandlerWrapped(ev, "NeutralList"), false);
		btnAvoid   .addEventListener("click", (ev) => assignListBtnHandlerWrapped(ev, "AvoidList"),   false);
		btnUnassign.addEventListener("click", (ev) => {
			ev.stopPropagation(); unassignListBtnHandler(ev, channelId, videoTile);
		}, false);
	}

	let isfilterVideosThrottled = false;

	function filterVideos() {
		[...document.querySelectorAll("ytd-rich-item-renderer:not([ListAssigned], ytd-rich-item-renderer[ListAssigned='none'])")].forEach((videoTile) => {
			let channelNameDiv = videoTile.querySelector("ytd-channel-name");
			if (!channelNameDiv) return;
			let channelId = channelNameDiv.querySelector("a")?.href?.match(/(?<=@).+/)?.[0];
			if (!channelId) return;

			createTheButtons(videoTile, channelNameDiv, channelId);

			if (AvoidList.includes(channelId)) {
				videoTile.setAttribute("ListAssigned","AvoidList");
			} else if (NeutralList.includes(channelId)) {
				videoTile.setAttribute("ListAssigned","NeutralList");
			} else if (InspireList.includes(channelId)) {
				videoTile.setAttribute("ListAssigned","InspireList");
			} else {
				videoTile.setAttribute("ListAssigned","none");
			}
		});
	}

	const throttled_FilterVideos = () => {
		if (isfilterVideosThrottled) return;
		filterVideos();

		isfilterVideosThrottled = true;
		setTimeout(() => {
			isfilterVideosThrottled = false;
		}, 3000);
	};

	let observer = new MutationObserver(throttled_FilterVideos);
	observer.observe(document, { childList: true, subtree: true });
	throttled_FilterVideos();
})();