// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Registre de certification de diplômes académiques
/// @notice Seul l'owner (administrateur) peut émettre ou révoquer ; la lecture est publique.
contract CertificateRegistry is Ownable {
    uint256 public constant MAX_BATCH = 10;

    struct Certificate {
        uint256 id;
        string studentName;
        string studentId; // CNE, unique
        string diplomaTitle;
        string issueDate;
        string grade; // optionnel
        address recipientAddress; // optionnel (address(0) si absent)
        bool revoked;
        uint256 issuedAt;
    }

    uint256 private _lastId;
    mapping(uint256 => Certificate) private _certificates;
    mapping(string => bool) public studentIdExists;

    event CertificateIssued(uint256 indexed id, string studentId, string studentName, string diplomaTitle);
    event CertificateRevoked(uint256 indexed id);

    constructor() Ownable(msg.sender) {}

    function mintCertificate(
        string calldata _studentName,
        string calldata _studentId,
        string calldata _diplomaTitle,
        string calldata _issueDate,
        string calldata _grade,
        address _recipientAddress
    ) external onlyOwner returns (uint256) {
        return _issue(_studentName, _studentId, _diplomaTitle, _issueDate, _grade, _recipientAddress);
    }

    /// @notice Émission par lots (tableaux parallèles, 10 maximum). Tout ou rien.
    function mintBatch(
        string[] memory _studentNames,
        string[] memory _studentIds,
        string[] memory _diplomaTitles,
        string[] memory _issueDates,
        string[] memory _grades,
        address[] memory _recipients
    ) external onlyOwner returns (uint256 firstId, uint256 lastId) {
        uint256 n = _studentNames.length;
        require(n > 0, "Lot vide");
        require(n <= MAX_BATCH, "Maximum 10 certificats par lot");
        require(
            _studentIds.length == n &&
                _diplomaTitles.length == n &&
                _issueDates.length == n &&
                _grades.length == n &&
                _recipients.length == n,
            "Tableaux de longueurs differentes"
        );
        firstId = _lastId + 1;
        for (uint256 i = 0; i < n; i++) {
            _issue(_studentNames[i], _studentIds[i], _diplomaTitles[i], _issueDates[i], _grades[i], _recipients[i]);
        }
        lastId = _lastId;
    }

    function revokeCertificate(uint256 _id) external onlyOwner {
        require(_id >= 1 && _id <= _lastId, "Certificat introuvable");
        Certificate storage c = _certificates[_id];
        require(!c.revoked, "Certificat deja revoque");
        c.revoked = true;
        emit CertificateRevoked(_id);
    }

    function getCertificate(uint256 _id) external view returns (Certificate memory) {
        require(_id >= 1 && _id <= _lastId, "Certificat introuvable");
        return _certificates[_id];
    }

    function totalCertificates() external view returns (uint256) {
        return _lastId;
    }

    function _issue(
        string memory _studentName,
        string memory _studentId,
        string memory _diplomaTitle,
        string memory _issueDate,
        string memory _grade,
        address _recipientAddress
    ) internal returns (uint256 id) {
        require(bytes(_studentName).length > 0, "Nom requis");
        require(bytes(_studentId).length > 0, "CNE requis");
        require(bytes(_diplomaTitle).length > 0, "Intitule requis");
        require(bytes(_issueDate).length > 0, "Date requise");
        require(!studentIdExists[_studentId], "Ce CNE est deja enregistre");

        studentIdExists[_studentId] = true;
        id = ++_lastId;
        _certificates[id] = Certificate({
            id: id,
            studentName: _studentName,
            studentId: _studentId,
            diplomaTitle: _diplomaTitle,
            issueDate: _issueDate,
            grade: _grade,
            recipientAddress: _recipientAddress,
            revoked: false,
            issuedAt: block.timestamp
        });
        emit CertificateIssued(id, _studentId, _studentName, _diplomaTitle);
    }
}
