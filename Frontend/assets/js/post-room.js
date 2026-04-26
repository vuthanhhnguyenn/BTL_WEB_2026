(() => {
  const SUCCESS_KEY = "troxinh_post_room_success";
  // Setup debug logging to page
  const debugLogs = [];
  const originalLog = console.log;
  const originalError = console.error;

  console.log = function (...args) {
    originalLog.apply(console, args);
    debugLogs.push("LOG: " + args.join(" "));
  };

  console.error = function (...args) {
    originalError.apply(console, args);
    debugLogs.push("ERROR: " + args.join(" "));
  };
  const form = document.getElementById("postRoomForm");
  const preview = document.getElementById("imagePreview");
  const imageCount = document.getElementById("imageCount");
  const picker = document.getElementById("dropzone");
  const fileInput = document.getElementById("images");
  const messageNode = document.getElementById("postMessage");

  const objectUrlMap = new WeakMap();
  let selectedFiles = [];
  let isDropActive = false;
  let isSubmitting = false;

  const loadingOverlay = document.createElement("div");
  loadingOverlay.className = "loading-overlay";
  loadingOverlay.hidden = true;
  loadingOverlay.innerHTML = `
    <div class="loading-card" role="status" aria-live="polite">
      <div class="loading-spinner"></div>
      <strong>Đang đăng bài viết</strong>
      <span>Hệ thống đang tải ảnh và lưu dữ liệu lên máy chủ...</span>
    </div>
  `;
  document.body.appendChild(loadingOverlay);

  const showMessage = (message, type = "success") => {
    if (!messageNode) return;
    messageNode.className = `message ${type}`;
    messageNode.textContent = message;
    messageNode.hidden = false;
    // Scroll to message to make sure user sees it
    setTimeout(() => {
      messageNode?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const clearMessage = () => {
    if (!messageNode) return;
    messageNode.hidden = true;
    messageNode.textContent = "";
    messageNode.className = "";
  };

  const showSuccessFeedback = (message) => {
    sessionStorage.setItem(SUCCESS_KEY, message);
    showMessage(message, "success");
    // Redirect to my-listings page after 2 seconds to show the success message
    setTimeout(() => {
      window.location.href = "my-listings.html";
    }, 2000);
  };

  const restoreSuccessFeedback = () => {
    const message = sessionStorage.getItem(SUCCESS_KEY);
    if (!message) return;
    sessionStorage.removeItem(SUCCESS_KEY);
    showMessage(message, "success");
  };

  const setLoadingState = (loading) => {
    isSubmitting = loading;
    loadingOverlay.hidden = !loading;
    form
      ?.querySelectorAll("input, select, textarea, button")
      .forEach((node) => {
        if (node.id === "images") return;
        node.disabled = loading;
      });
    if (picker) {
      picker.setAttribute("aria-disabled", loading ? "true" : "false");
    }
  };

  const formatPrice = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(value)} vnđ`;

  const updateImageCount = () => {
    if (!imageCount) return;
    imageCount.textContent = selectedFiles.length
      ? `${selectedFiles.length} ảnh đã chọn`
      : "0 ảnh";
  };

  const syncFilesToInput = () => {
    if (!fileInput) return;
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach((file) => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;
  };

  const clearObjectUrls = (files = selectedFiles) => {
    files.forEach((file) => {
      const objectUrl = objectUrlMap.get(file);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    });
  };

  const setPickerState = (active) => {
    isDropActive = active;
    picker?.classList.toggle("is-dragover", active);
  };

  const openFileDialog = () => {
    if (isSubmitting) return;
    fileInput?.click();
  };

  const addFiles = (incomingFiles) => {
    const nextFiles = [...selectedFiles];
    incomingFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const exists = nextFiles.some(
        (current) =>
          current.name === file.name &&
          current.size === file.size &&
          current.lastModified === file.lastModified,
      );
      if (!exists) nextFiles.push(file);
    });

    selectedFiles = nextFiles;
    syncFilesToInput();
    renderPreview();
  };

  const removeFileAt = (index) => {
    if (isSubmitting) return;
    const removed = selectedFiles[index];
    if (removed) clearObjectUrls([removed]);
    selectedFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);
    syncFilesToInput();
    renderPreview();
  };

  const renderPreview = () => {
    if (!preview) return;

    const cards = selectedFiles
      .map((file, index) => {
        const objectUrl = objectUrlMap.get(file) || URL.createObjectURL(file);
        objectUrlMap.set(file, objectUrl);

        return `
        <article class="image-preview-card">
          <img src="${objectUrl}" alt="${file.name}">
          <button class="image-remove-btn" type="button" data-remove-index="${index}" aria-label="Xóa ảnh ${file.name}">×</button>
        </article>
      `;
      })
      .join("");

    preview.innerHTML = `
      ${cards}
      <button class="image-add-tile" type="button" id="addImageTile" aria-label="Thêm ảnh">
        <span class="image-add-plus">+</span>
        <span>Thêm ảnh</span>
      </button>
    `;

    preview.querySelectorAll("[data-remove-index]").forEach((button) => {
      button.addEventListener("click", () =>
        removeFileAt(Number(button.dataset.removeIndex)),
      );
    });
    preview
      .querySelector("#addImageTile")
      ?.addEventListener("click", openFileDialog);
    updateImageCount();
  };

  const initPriceSlider = () => {
    const priceFromSlider = document.getElementById("priceFromSlider");
    const priceFromInput = document.getElementById("priceFrom");
    const priceFromDisplay = document.getElementById("priceFromDisplay");
    const priceToSlider = document.getElementById("priceToSlider");
    const priceToInput = document.getElementById("priceTo");
    const priceToDisplay = document.getElementById("priceToDisplay");

    if (priceFromSlider && priceFromInput && priceFromDisplay) {
      const syncSliderToInput = () => {
        priceFromInput.value = priceFromSlider.value;
        priceFromDisplay.textContent = formatPrice(priceFromSlider.value);
      };
      const syncInputToSlider = () => {
        priceFromSlider.value = priceFromInput.value;
        priceFromDisplay.textContent = formatPrice(priceFromInput.value);
      };
      priceFromSlider.addEventListener("input", syncSliderToInput);
      priceFromInput.addEventListener("input", syncInputToSlider);
      syncSliderToInput();
    }

    if (priceToSlider && priceToInput && priceToDisplay) {
      const syncSliderToInput = () => {
        priceToInput.value = priceToSlider.value;
        priceToDisplay.textContent = formatPrice(priceToSlider.value);
      };
      const syncInputToSlider = () => {
        priceToSlider.value = priceToInput.value;
        priceToDisplay.textContent = formatPrice(priceToInput.value);
      };
      priceToSlider.addEventListener("input", syncSliderToInput);
      priceToInput.addEventListener("input", syncInputToSlider);
      syncSliderToInput();
    }
  };

  const validatePayload = (payload, files) => {
    const requiredFields = [
      "title",
      "address",
      "district",
      "city",
      "mapAddress",
      "priceFrom",
      "priceTo",
      "area",
      "direction",
      "bedrooms",
      "bathrooms",
      "description",
    ];

    for (const field of requiredFields) {
      if (!payload[field] && payload[field] !== 0) {
        throw new Error("Vui lòng nhập đầy đủ thông tin phòng cho thuê.");
      }
    }

    if (
      !payload.contact.name ||
      !payload.contact.phone ||
      !payload.contact.email
    ) {
      throw new Error("Vui lòng nhập đầy đủ thông tin liên hệ người đăng tin.");
    }

    if (Number(payload.priceFrom) > Number(payload.priceTo)) {
      throw new Error("Giá từ không được lớn hơn giá đến.");
    }

    if (!files.length) {
      throw new Error("Vui lòng chọn ít nhất một ảnh trước khi đăng tin.");
    }
  };

  const resetFormState = () => {
    clearObjectUrls();
    selectedFiles = [];
    form?.reset();
    syncFilesToInput();
    renderPreview();
    initPriceSlider();
    setPickerState(false);
  };

  const init = () => {
    if (!form) return;

    initPriceSlider();
    renderPreview();
    restoreSuccessFeedback();

    fileInput?.addEventListener("change", () =>
      addFiles(Array.from(fileInput.files || [])),
    );

    picker?.addEventListener("click", (event) => {
      if (isSubmitting) return;
      if (event.target.closest(".image-remove-btn")) return;
      if (event.target.closest(".image-add-tile")) return;
      openFileDialog();
    });

    picker?.addEventListener("keydown", (event) => {
      if (isSubmitting) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFileDialog();
      }
    });

    picker?.addEventListener("dragenter", (event) => {
      event.preventDefault();
      if (!isSubmitting) setPickerState(true);
    });

    picker?.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!isSubmitting && !isDropActive) setPickerState(true);
    });

    picker?.addEventListener("dragleave", (event) => {
      event.preventDefault();
      if (event.target === picker) setPickerState(false);
    });

    picker?.addEventListener("drop", (event) => {
      event.preventDefault();
      setPickerState(false);
      if (isSubmitting) return;
      addFiles(Array.from(event.dataTransfer?.files || []));
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      console.log("Form submitted, preventing default behavior");

      if (isSubmitting) {
        console.log("Already submitting, ignoring");
        return;
      }

      clearMessage();
      const formData = new FormData(form);
      const files = Array.from(formData.getAll("images")).filter(
        (item) => item && item.name,
      );
      const payload = {
        title: String(formData.get("title") || "").trim(),
        address: String(formData.get("address") || "").trim(),
        district: String(formData.get("district") || "").trim(),
        city: String(formData.get("city") || "").trim(),
        mapAddress: String(formData.get("mapAddress") || "").trim(),
        priceFrom: Number(formData.get("priceFrom")),
        priceTo: Number(formData.get("priceTo")),
        area: Number(formData.get("area")),
        direction: String(formData.get("direction") || "").trim(),
        bedrooms: Number(formData.get("bedrooms")),
        bathrooms: Number(formData.get("bathrooms")),
        description: String(formData.get("description") || "").trim(),
        contact: {
          name: String(formData.get("contactName") || "").trim(),
          phone: String(formData.get("contactPhone") || "").trim(),
          email: String(formData.get("contactEmail") || "").trim(),
        },
      };

      try {
        console.log("Validating payload...");
        validatePayload(payload, files);
        console.log("Payload valid, setting loading state");
        setLoadingState(true);

        console.log("Making API call...");
        const result = await ApiService.createListing(payload, files);
        console.log("API call successful:", result);

        const successMessage =
          "Bài viết của bạn đã đăng tải thành công. Hãy chờ admin kiểm duyệt.";
        showMessage(successMessage, "success");

        // Store message and redirect after short delay to show message
        sessionStorage.setItem(SUCCESS_KEY, successMessage);
        console.log("Redirecting to my-listings in 2 seconds...");
        setTimeout(() => {
          window.location.href = "my-listings.html";
        }, 2000);
      } catch (error) {
        console.error("Error in form submission:", error);
        let errorMessage = "Không thể đăng tin lúc này.";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        } else if (error && typeof error === "object") {
          errorMessage = error.message || JSON.stringify(error);
        }

        console.error("Displaying error:", errorMessage);
        showMessage(errorMessage, "error");
        setLoadingState(false);
      }
    });
  };

  init();
})();
