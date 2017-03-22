var db_obj;
//初始化
(function initDB() {
	var request = indexedDB.open('disannoy', 1);
	request.onerror = function(e) {
		console.log(e.currentTarget.error.message);
	};
	request.onsuccess = function(e) {
		db_obj = e.target.result;
	};
	request.onupgradeneeded = function(e) {
		var thisDB = e.target.result;
		if (!thisDB.objectStoreNames.contains("diary")) {
			var objStore = thisDB.createObjectStore("diary", {
				keyPath : "id",
				autoIncrement : true
			});
			objStore.createIndex("create_date", "create_date", {
				unique : false
			});
			objStore.createIndex("modify_date", "modify_date", {
				unique : false
			});
			objStore.createIndex("folder", "folder", {
				unique : false
			});
		}
	};
})();
//关闭
function closeDB() {
	db_obj.close();
}

//删除
function deleteDB() {
	indexedDB.deleteDatabase('disannoy');
}

//添加一条数据
function addData(data, cb) {
	var transaction = db_obj.transaction("diary", 'readwrite');
	transaction.oncomplete = function() {
		console.log("transaction complete");
	};
	transaction.onerror = function(event) {
		console.dir(event)
	};
	var objectStore = transaction.objectStore("diary");
	var request = objectStore.add(data);
	request.onsuccess = function(e) {
		if (cb) {
			cb({
				error : 0,
				data : data
			})
		}
	};
	request.onerror = function(e) {
		if (cb) {
			cb({
				error : 1
			})
		}
	}
}

//添加多条数据
function addmData(mdata, cb) {
	var transaction = db_obj.transaction("diary", 'readwrite');
	transaction.oncomplete = function() {
		console.log("transaction complete");
	};
	transaction.onerror = function(event) {
		console.dir(event)
	};
	var objectStore = transaction.objectStore("diary");
	for (var c = 0; c < mdata.length; c++) {
		var request = objectStore.add(mdata[c]);
		request.onerror = function(e) {
			if (cb) {
				cb({
					error : 1
				})
			}
		}
	}
}

//删除一条数据
function deleteData(id, cb) {
	var transaction = db_obj.transaction("diary", 'readwrite');
	transaction.oncomplete = function() {
		console.log("transaction complete");
	};
	transaction.onerror = function(event) {
		console.dir(event)
	};
	var objectStore = transaction.objectStore("diary");
	var request = objectStore.delete(id);
	request.onsuccess = function(e) {
		if (cb) {
			cb({
				error : 0,
				data : id
			})
		}
	};
	request.onerror = function(e) {
		if (cb) {
			cb({
				error : 1
			})
		}
	}
}

//用id读取数据
function getDataById(id, cb) {
	var transaction = db_obj.transaction("diary", 'readwrite');
	transaction.oncomplete = function() {
		console.log("transaction complete");
	};
	transaction.onerror = function(event) {
		console.dir(event)
	};

	var objectStore = transaction.objectStore("diary");
	var request = objectStore.get(id);
	request.onsuccess = function(e) {
		if (cb) {
			cb({
				error : 0,
				data : e.target.result
			})
		}
	};
	request.onerror = function(e) {
		if (cb) {
			cb({
				error : 1
			})
		}
	}
}

//检测month文件夹是否有内容
function checkMonthContent(id, cb) {
	indexedDB.open('disannoy', 1).onsuccess = function(e) {
		db_obj = e.target.result;
		var transaction = db_obj.transaction("diary", 'readwrite');
		transaction.oncomplete = function() {
			console.log("transaction complete");
		};
		transaction.onerror = function(event) {
			console.dir(event)
		};
		var objectStore = transaction.objectStore("diary");
		var request = objectStore.index("folder").get(id);
		request.onsuccess = function(e) {
			if (cb) {
				cb({
					error : 0,
					data : e.target.result,
					year : id.substring(0, 4),
					month : id.substring(4, 6),
					id : id
				})
			}
		};
		request.onerror = function(e) {
			if (cb) {
				cb({
					error : 1
				})
			}
		}
	};
}

//按创建时间排列
function getDataAll(cb) {
	indexedDB.open('disannoy', 1).onsuccess = function(e) {
		db_obj = e.target.result;
		var transaction = db_obj.transaction("diary", 'readonly');
		transaction.oncomplete = function() {
			console.log("transaction complete");
		};
		transaction.onerror = function(event) {
			console.dir(event)
		};
		var objectStore = transaction.objectStore("diary");
		var rowData = [];
		objectStore.openCursor(IDBKeyRange.lowerBound(0)).onsuccess = function(event) {
			var cursor = event.target.result;
			if (!cursor && cb) {
				cb({
					error : 0,
					data : rowData
				});
				return;
			}
			//			rowData.push(cursor.value);
			rowData.unshift(cursor.value);
			cursor.continue();
		};
	};
}

//按修改日期排列
function getMDList(cb) {
	indexedDB.open('disannoy', 1).onsuccess = function(e) {
		db_obj = e.target.result;
		var transaction = db_obj.transaction("diary", 'readonly');
		transaction.oncomplete = function() {
			console.log("transaction complete");
		};
		transaction.onerror = function(event) {
			console.dir(event)
		};
		var objectStore = transaction.objectStore("diary");
		var rowData = [];
		objectStore.index("modify_date").openCursor(IDBKeyRange.lowerBound(0)).onsuccess = function(event) {
			var cursor = event.target.result;
			if (!cursor && cb) {
				cb({
					error : 0,
					data : rowData
				});
				return;
			}
			rowData.push(cursor.value);
			cursor.continue();
		};
	};
}

function getDataBySearch(keywords, cb) {
	indexedDB.open('disannoy', 1).onsuccess = function(e) {
		db_obj = e.target.result;
		var transaction = db_obj.transaction("diary", 'readwrite');
		transaction.oncomplete = function() {
			console.log("transaction complete");
		};
		transaction.onerror = function(event) {
			console.dir(event)
		};
		var objectStore = transaction.objectStore("diary");
		var boundKeyRange = IDBKeyRange.only(keywords);
		var rowData = [];
		objectStore.index("folder").openCursor(boundKeyRange).onsuccess = function(event) {
			var cursor = event.target.result;
			if (!cursor) {
				if (cb) {
					cb({
						error : 0,
						data : rowData
					})
				}
				return;
			}
			rowData.push(cursor.value);
			cursor.continue();
		};
	};
}

function getFirstCreateDate(cb) {
	indexedDB.open('disannoy', 1).onsuccess = function(e) {
		db_obj = e.target.result;
		var transaction = db_obj.transaction("diary", 'readwrite');
		transaction.oncomplete = function() {
			console.log("transaction complete");
		};
		transaction.onerror = function(event) {
			console.dir(event)
		};
		var objectStore = transaction.objectStore("diary");
		var rowData;
		objectStore.index("folder").openCursor(IDBKeyRange.lowerBound(0)).onsuccess = function(event) {
			var cursor = event.target.result;
			if (cb) {
				cb({
					error : 0,
					data : cursor.value
				})
			}
			return;

		};
	};
}

function getDataByPager(start, end, cb) {
	var transaction = db_obj.transaction("diary", 'readwrite');
	transaction.oncomplete = function() {
		console.log("transaction complete");
	};
	transaction.onerror = function(event) {
		console.dir(event)
	};
	var objectStore = transaction.objectStore("diary");
	var boundKeyRange = IDBKeyRange.bound(start, end, false, true);
	var rowData = [];
	objectStore.openCursor(boundKeyRange).onsuccess = function(event) {
		var cursor = event.target.result;
		if (!cursor && cb) {
			cb({
				error : 0,
				data : rowData
			});
			return;
		}
		rowData.push(cursor.value);
		cursor.continue();
	};
}

function updateData(id, updateData, cb) {
	var transaction = db_obj.transaction("diary", 'readwrite');
	transaction.oncomplete = function() {
		console.log("transaction complete");
	};
	transaction.onerror = function(event) {
		console.dir(event)
	};
	var objectStore = transaction.objectStore("diary");
	var request = objectStore.get(id);
	request.onsuccess = function(e) {
		var thisDB = e.target.result;
		for (key in updateData) {
			thisDB[key] = updateData[key];
		}
		objectStore.put(thisDB);
		if (cb) {
			cb({
				error : 0,
				data : thisDB
			})
		}
	};
	request.onerror = function(e) {
		if (cb) {
			cb({
				error : 1
			})
		}
	}
}

function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + date.getHours() + seperator2 + date.getMinutes() + seperator2 + date.getSeconds();
	return currentdate;
}
